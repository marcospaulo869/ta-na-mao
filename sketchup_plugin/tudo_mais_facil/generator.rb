# encoding: UTF-8
# ---------------------------------------------------------------------------
# Generator — reads the "TUDO_MAIS_FACIL_WALL" JSON payload and builds the
# 3D geometry (wall, openings, columns, beams, baseboard, markers).
# All measurements arrive in millimeters (from the app export).
# SketchUp uses inches internally, so we use `.mm` to convert.
# ---------------------------------------------------------------------------

require 'sketchup.rb'

module TudoMaisFacil
  module Generator

    WALL_THICKNESS_MM = 15.0 # 15 cm parede padrão (alvenaria)

    class << self

      # Entry point: expects the exported JSON dict (parsed).
      def build_from_export(payload)
        unless payload.is_a?(Hash) && payload['format'] == 'TUDO_MAIS_FACIL_WALL'
          ::UI.messagebox('Este JSON não é um export válido do Tudo Mais Fácil.')
          return
        end

        wall = payload['wall'] || {}
        model = Sketchup.active_model
        model.start_operation("Importar #{wall['nome'] || 'Parede'}", true)

        begin
          group = model.entities.add_group
          group.name = wall['nome'] || 'Parede'

          build_wall(group, wall)
          build_baseboard(group, wall)
          build_columns(group, wall)
          build_beams(group, wall)
          build_angled_walls(group, wall)
          build_markers(group, wall)

          model.commit_operation
          model.active_view.zoom(group)

          summary = build_summary(wall)
          ::UI.messagebox("#{wall['nome']} importada com sucesso!\n\n#{summary}")
        rescue => e
          model.abort_operation
          ::UI.messagebox("Erro ao gerar geometria:\n#{e.message}\n\n#{e.backtrace.first(3).join("\n")}")
        end
      end

      private

      # --- WALL + OPENINGS --------------------------------------------------

      def build_wall(group, wall)
        w = mm(wall['largura_total'])
        h = mm(wall['altura_pe_direito'])
        t = mm(WALL_THICKNESS_MM * 10) # 15 cm -> 150 mm

        # Front face on the XZ plane (Y = 0)
        pts = [
          Geom::Point3d.new(0, 0, 0),
          Geom::Point3d.new(w, 0, 0),
          Geom::Point3d.new(w, 0, h),
          Geom::Point3d.new(0, 0, h)
        ]
        face = group.entities.add_face(pts)
        face.reverse! if face.normal.y > 0

        # Apply wall color if provided
        cores = wall['cores'] || {}
        cor_hex = cores['parede_hex']
        if cor_hex && !cor_hex.empty?
          apply_material(face, "TMF Parede #{wall['numero']}", cor_hex)
        end

        # Cut openings BEFORE the pushpull so the holes go through the wall
        cut_openings(group, wall, h)

        # Extrude the wall (thickness)
        face.pushpull(-t)
      end

      def cut_openings(group, wall, wall_height)
        w_total = mm(wall['largura_total'])
        current_x = 0.0

        # Distribute doors evenly, then windows evenly after
        portas = wall['portas'] || []
        janelas = wall['janelas'] || []

        # Simple distribution: divide wall in slots for each opening
        total_items = portas.length + janelas.length
        return if total_items.zero?

        slot = w_total / (total_items + 1).to_f
        cursor = slot

        portas.each do |porta|
          lw = mm(porta['largura_vao'])
          lh = mm(porta['altura_vao'])
          x1 = cursor - lw / 2.0
          x2 = cursor + lw / 2.0
          add_opening(group, x1, 0, x2, lh)
          cursor += slot
        end

        janelas.each do |jan|
          lw = mm(jan['largura_vao'])
          lh = mm(jan['altura_vao'])
          sill = mm(1100) # janela padrão a 1,10m do piso
          x1 = cursor - lw / 2.0
          x2 = cursor + lw / 2.0
          add_opening(group, x1, sill, x2, sill + lh)
          cursor += slot
        end
      end

      # Draw a rectangle on the wall face and delete it -> creates a hole
      def add_opening(group, x1, z1, x2, z2)
        pts = [
          Geom::Point3d.new(x1, 0, z1),
          Geom::Point3d.new(x2, 0, z1),
          Geom::Point3d.new(x2, 0, z2),
          Geom::Point3d.new(x1, 0, z2)
        ]
        opening = group.entities.add_face(pts)
        opening.erase! if opening && opening.valid?
      end

      # --- BASEBOARD (Rodapé) ----------------------------------------------

      def build_baseboard(group, wall)
        return unless wall['altura_rodape']
        h = mm(wall['altura_rodape'])
        e = mm(wall['espessura_rodape'] || 15) # 15 mm default
        w = mm(wall['largura_total'])
        return if h <= 0

        base_group = group.entities.add_group
        base_group.name = 'Rodapé'

        pts = [
          Geom::Point3d.new(0, -e, 0),
          Geom::Point3d.new(w, -e, 0),
          Geom::Point3d.new(w, -e, h),
          Geom::Point3d.new(0, -e, h)
        ]
        face = base_group.entities.add_face(pts)
        face.reverse! if face.normal.y > 0
        face.pushpull(e)
      end

      # --- COLUMNS ----------------------------------------------------------

      def build_columns(group, wall)
        cols = wall['colunas'] || []
        return if cols.empty?

        h = mm(wall['altura_pe_direito'])
        w_total = mm(wall['largura_total'])
        # Distribute columns evenly along wall
        slot = w_total / (cols.length + 1).to_f
        cursor = slot

        cols.each_with_index do |col, i|
          cw = mm(col['largura'])
          cp = mm(col['profundidade'])

          col_group = group.entities.add_group
          col_group.name = "Coluna #{i + 1}"

          x1 = cursor - cw / 2.0
          x2 = cursor + cw / 2.0

          pts = [
            Geom::Point3d.new(x1, 0, 0),
            Geom::Point3d.new(x2, 0, 0),
            Geom::Point3d.new(x2, -cp, 0),
            Geom::Point3d.new(x1, -cp, 0)
          ]
          face = col_group.entities.add_face(pts)
          face.reverse! if face.normal.z < 0
          face.pushpull(h)
          cursor += slot
        end
      end

      # --- BEAMS ------------------------------------------------------------

      def build_beams(group, wall)
        vigas = wall['vigas'] || []
        return if vigas.empty?

        h = mm(wall['altura_pe_direito'])
        w_total = mm(wall['largura_total'])

        vigas.each_with_index do |v, i|
          vh = mm(v['altura'])
          vw = mm(v['largura'])

          beam_group = group.entities.add_group
          beam_group.name = "Viga #{i + 1}"

          pts = [
            Geom::Point3d.new(0, 0, h - vh),
            Geom::Point3d.new(w_total, 0, h - vh),
            Geom::Point3d.new(w_total, -vw, h - vh),
            Geom::Point3d.new(0, -vw, h - vh)
          ]
          face = beam_group.entities.add_face(pts)
          face.reverse! if face.normal.z < 0
          face.pushpull(vh)
        end
      end

      # --- ANGLED WALLS (Paredes em ângulo) --------------------------------
      # Each angled wall attaches at the right corner of the main wall and
      # folds inward according to the interior angle (in degrees).
      #   angulo = 180° → straight extension  (collinear)
      #   angulo = 135° → 45° cut corner (common bevel)
      #   angulo = 90°  → perpendicular L-corner
      # ---------------------------------------------------------------------

      def build_angled_walls(group, wall)
        angled = wall['paredes_angulo'] || []
        return if angled.empty?

        w_total   = mm(wall['largura_total'])
        pe_direito = mm(wall['altura_pe_direito'])
        t         = mm(WALL_THICKNESS_MM * 10) # 150 mm alvenaria

        # anchor at the right corner of the main wall, at floor level
        anchor = Geom::Point3d.new(w_total, 0, 0)

        angled.each_with_index do |seg, i|
          length = mm(seg['comprimento'])
          height = mm(seg['altura'] || wall['altura_pe_direito'])
          ang    = (seg['angulo'] || 135).to_f
          theta  = (180.0 - ang) * Math::PI / 180.0
          dir_x  = Math.cos(theta)
          dir_y  = Math.sin(theta)

          # Face plane vectors
          dx = dir_x * length
          dy = dir_y * length

          seg_group = group.entities.add_group
          seg_group.name = "Parede ângulo #{i + 1} (#{ang.to_i}°)"

          p1 = Geom::Point3d.new(anchor.x,      anchor.y,      0)
          p2 = Geom::Point3d.new(anchor.x + dx, anchor.y + dy, 0)
          p3 = Geom::Point3d.new(anchor.x + dx, anchor.y + dy, height)
          p4 = Geom::Point3d.new(anchor.x,      anchor.y,      height)

          face = seg_group.entities.add_face([p1, p2, p3, p4])
          # Perpendicular direction pointing inward (rotate direction -90° around Z)
          normal_y_sign = face.normal.y
          # Push toward interior (opposite of main wall's -Y push)
          push_dir = -t
          face.pushpull(push_dir)

          # Move anchor to the end of this segment so the next angled wall
          # continues from here (chaining segments)
          anchor = Geom::Point3d.new(anchor.x + dx, anchor.y + dy, 0)
        end
      end

      # --- MARKERS (Tomadas, interruptores, água, esgoto, gás, registro) ---

      MARKER_CONFIG = {
        'tomadas'         => { color: '#3498DB', size: 60 },  # blue - electric outlet
        'interruptores'   => { color: '#F1C40F', size: 60 },  # yellow - light switch
        'saidas_agua'     => { color: '#1ABC9C', size: 40 },  # teal - water in
        'saidas_esgoto'   => { color: '#7F8C8D', size: 60 },  # gray - sewage
        'saidas_gas'      => { color: '#E67E22', size: 40 },  # orange - gas
        'registros_agua'  => { color: '#2ECC71', size: 50 }   # green - water register
      }.freeze

      MARKER_LABELS = {
        'tomadas'        => 'Tomada',
        'interruptores'  => 'Interruptor',
        'saidas_agua'    => 'Saída Água',
        'saidas_esgoto'  => 'Saída Esgoto',
        'saidas_gas'     => 'Saída Gás',
        'registros_agua' => 'Registro'
      }.freeze

      def build_markers(group, wall)
        pontos = wall['pontos'] || {}
        w_total = mm(wall['largura_total'])

        pontos.each do |key, list|
          next if list.nil? || list.empty?
          config = MARKER_CONFIG[key] || { color: '#FFFFFF', size: 40 }
          label  = MARKER_LABELS[key] || key

          marker_group = group.entities.add_group
          marker_group.name = "#{label}s"

          list.each_with_index do |pt, i|
            dist = mm(pt['distancia_centro'] || 0)
            lado = pt['lado'] || 'direito'
            altura = mm(pt['altura_piso'] || 300)

            # 'direito' means measured from right corner
            x = lado == 'direito' ? (w_total - dist) : dist

            create_marker(marker_group, x, altura, config[:color], mm(config[:size]), "#{label} #{i + 1}")
          end
        end
      end

      def create_marker(parent, x, z, hex, size, name)
        marker = parent.entities.add_group
        marker.name = name

        s = size / 2.0
        pts = [
          Geom::Point3d.new(x - s, 0, z - s),
          Geom::Point3d.new(x + s, 0, z - s),
          Geom::Point3d.new(x + s, 0, z + s),
          Geom::Point3d.new(x - s, 0, z + s)
        ]
        face = marker.entities.add_face(pts)
        face.reverse! if face.normal.y > 0
        apply_material(face, "TMF #{name}", hex) if hex
        face.pushpull(mm(20)) # 2 cm proud of the wall
      end

      # --- HELPERS ----------------------------------------------------------

      # Convert millimeters to SketchUp internal length (inches).
      def mm(value)
        (value.to_f).mm
      end

      def apply_material(face, name, hex_color)
        model = Sketchup.active_model
        mat = model.materials[name] || model.materials.add(name)
        mat.color = Sketchup::Color.new(hex_to_rgb(hex_color))
        face.material = mat
      end

      def hex_to_rgb(hex)
        h = hex.sub('#', '')
        return [200, 200, 200] unless h.length == 6
        [h[0, 2].to_i(16), h[2, 2].to_i(16), h[4, 2].to_i(16)]
      end

      def build_summary(wall)
        aberturas = (wall['portas'] || []).length + (wall['janelas'] || []).length
        p = wall['pontos'] || {}
        instalacoes = %w[tomadas interruptores saidas_agua saidas_esgoto saidas_gas registros_agua]
                      .map { |k| (p[k] || []).length }.inject(0) { |acc, n| acc + n }
        "• Pé direito: #{wall['altura_pe_direito']} mm\n" \
        "• Largura total: #{wall['largura_total']} mm\n" \
        "• Colunas: #{(wall['colunas'] || []).length}\n" \
        "• Vigas: #{(wall['vigas'] || []).length}\n" \
        "• Paredes em ângulo: #{(wall['paredes_angulo'] || []).length}\n" \
        "• Aberturas (portas+janelas): #{aberturas}\n" \
        "• Instalações: #{instalacoes}"
      end

    end
  end
end
