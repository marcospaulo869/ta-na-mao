# encoding: UTF-8
# ---------------------------------------------------------------------------
# Construtor de Módulos — 2º plugin da linha Marcenaria.
# Cria caixa parametrizada (chapa MDF/MDP) com portas, gavetas, prateleiras
# e divisórias. Primeira compilação — geometria simplificada para iterar.
# ---------------------------------------------------------------------------

require 'sketchup.rb'
require 'json'

module TudoMaisFacil
  module Modulo

    class << self

      COLOR_PRESETS = {
        'branco_tx'   => { 'nome' => 'Branco Texturizado', 'hex' => '#f2eee7' },
        'preto_tx'    => { 'nome' => 'Preto Texturizado',  'hex' => '#26241f' },
        'carvalho'    => { 'nome' => 'Carvalho Natural',   'hex' => '#c9a26a' },
        'nogueira'    => { 'nome' => 'Nogueira',           'hex' => '#5c3a1e' },
        'cinza_areia' => { 'nome' => 'Cinza Areia',        'hex' => '#a09587' }
      }.freeze

      PUXADORES = ['Perfil Gola', 'Tirante Cromado', 'Alça Concha', 'Puxador Cabo', 'Sem Puxador'].freeze
      DOBRADICAS = ['Reta 105°', 'Curva 105°', 'Caneco 26mm', 'Caneco 35mm (padrão)'].freeze
      POS_USINAGEM = ['Topo (10 cm)', 'Meio', 'Base (10 cm)', 'Topo + Base'].freeze
      TIPO_GAVETA = ['Gaveta p/ trilho telescópico', 'Gaveta p/ trilho oculto'].freeze
      TIPO_TRILHO = ['Telescópico convencional', 'Telescópico oculto (soft-close)'].freeze

      def show_wizard
        html_path = File.join(TudoMaisFacil::PLUGIN_ROOT, 'ui', 'modulo.html')

        @dlg = ::UI::HtmlDialog.new(
          dialog_title:    'Construtor de Módulos — Tudo Mais Fácil',
          preferences_key: 'tmf_modulo',
          scrollable:      true,
          resizable:       true,
          width:           620,
          height:          860,
          style:           ::UI::HtmlDialog::STYLE_DIALOG
        )
        @dlg.set_file(html_path)

        @dlg.add_action_callback('ready') do |_ctx|
          push_presets
        end

        @dlg.add_action_callback('build') do |_ctx, payload_json|
          begin
            params = JSON.parse(payload_json)
            build_modulo(params)
          rescue => e
            ::UI.messagebox("Erro ao gerar módulo:\n#{e.message}\n\n#{e.backtrace.first(3).join("\n")}")
          end
        end

        @dlg.add_action_callback('close') do |_ctx|
          @dlg.close if @dlg
        end

        @dlg.show
      end

      # --- 3D BUILDER (primeira compilação) --------------------------------
      def build_modulo(p)
        h  = p['altura'].to_f.mm
        w  = p['largura'].to_f.mm
        d  = p['profundidade'].to_f.mm
        t  = p['espessura_chapa'].to_f.mm
        n_portas    = p['numero_portas'].to_i
        n_gavetas   = p['numero_gavetas'].to_i
        n_prat      = p['numero_prateleiras'].to_i
        n_divis     = p['numero_divisorias'].to_i
        fundo_t     = p['espessura_fundo_modulo'].to_f.mm
        cor_key     = p['cor_chapa']
        preset      = COLOR_PRESETS[cor_key] || COLOR_PRESETS['branco_tx']

        if h <= 0 || w <= 0 || d <= 0 || t <= 0
          ::UI.messagebox('Informe altura, largura, profundidade e espessura de chapa maiores que zero.')
          return
        end

        model = Sketchup.active_model
        model.start_operation('Construir Módulo', true)

        begin
          root = model.entities.add_group
          root.name = "Módulo #{p['nome'] || ''} #{w.to_l.to_s} x #{h.to_l.to_s}"

          # Material da chapa
          mat = model.materials["TMF Chapa #{cor_key}"] || model.materials.add("TMF Chapa #{cor_key}")
          mat.color = Sketchup::Color.new(hex_to_rgb(preset['hex']))

          # Estrutura da caixa (base, topo, laterais, fundo)
          add_box(root, 0,       0, 0,       w, d, t, mat, 'Base')                                 # base
          add_box(root, 0,       0, h - t,   w, d, t, mat, 'Topo (estrutura superior frontal)')    # topo
          add_box(root, 0,       0, t,       t, d, h - 2 * t, mat, 'Lateral esquerda')
          add_box(root, w - t,   0, t,       t, d, h - 2 * t, mat, 'Lateral direita')
          add_box(root, 0,       d - fundo_t, t, w, fundo_t, h - 2 * t, mat, 'Fundo módulo') if fundo_t > 0

          # Prateleiras internas — espaçamento uniforme entre base e topo
          if n_prat > 0
            interior_h = h - 2 * t
            step = interior_h / (n_prat + 1).to_f
            n_prat.times do |i|
              z = t + step * (i + 1)
              add_box(root, t, 0, z, w - 2 * t, d - fundo_t, t, mat, "Prateleira #{i + 1}")
            end
          end

          # Divisórias verticais
          if n_divis > 0
            step = w / (n_divis + 1).to_f
            n_divis.times do |i|
              x = step * (i + 1) - t / 2.0
              add_box(root, x, 0, t, t, d - fundo_t, h - 2 * t, mat, "Divisória #{i + 1}")
            end
          end

          # Portas frontais — divide a largura pelo número de portas
          # Cada porta é uma face 2 mm à frente do módulo (Y = -2mm) com t de espessura
          if n_portas > 0
            porta_w = (w - 4.mm) / n_portas.to_f  # 2mm de folga em cada lado
            porta_h = h - 4.mm - (n_gavetas > 0 ? gaveta_area_h(h, n_gavetas) : 0)
            n_portas.times do |i|
              x = 2.mm + porta_w * i
              add_box(root, x + 1.mm, -2.mm - t, 2.mm, porta_w - 2.mm, t, porta_h, mat, "Porta #{i + 1}")
            end
          end

          # Gavetas (frentes) na parte inferior do módulo
          if n_gavetas > 0
            area_h = gaveta_area_h(h, n_gavetas)
            each_h = area_h / n_gavetas.to_f
            n_gavetas.times do |i|
              z = 2.mm + each_h * i
              add_box(root, 2.mm, -2.mm - t, z, w - 4.mm, t, each_h - 2.mm, mat, "Frente gaveta #{i + 1}")
            end
          end

          # Atributos (para futura estimativa de custo / plano de corte)
          root.set_attribute('tmf', 'kind', 'modulo')
          %w[altura largura profundidade espessura_chapa numero_portas numero_gavetas
             numero_prateleiras numero_divisorias cor_chapa valor_chapa espessura_fundo_modulo
             espessura_fundo_gaveta espessura_estrutura_gaveta folga_gaveta
             tipo_puxador tipo_dobradica pos_usinagem_dobradica
             tipo_gaveta tipo_trilho comprimento_trilho valor_trilho].each do |k|
            root.set_attribute('tmf', k, p[k]) if p.key?(k)
          end

          model.commit_operation
          model.active_view.zoom(root)

          area_chapa = estimate_area_m2(h / 1.mm, w / 1.mm, d / 1.mm, t / 1.mm,
                                        n_portas, n_gavetas, n_prat, n_divis)
          valor_chapa = p['valor_chapa'].to_f
          custo_chapa = (area_chapa * valor_chapa).round(2)
          custo_trilho = (n_gavetas * p['valor_trilho'].to_f).round(2)

          msg = "Módulo gerado!\n\n" \
                "• #{preset['nome']} · #{p['espessura_chapa']} mm de chapa\n" \
                "• Dim: #{p['largura']} × #{p['altura']} × #{p['profundidade']} mm\n" \
                "• #{n_portas} porta(s), #{n_gavetas} gaveta(s), " \
                "#{n_prat} prateleira(s), #{n_divis} divisória(s)\n\n" \
                "• Área estimada de chapa: #{format('%.2f', area_chapa)} m²\n" \
                "• Custo estimado da chapa: R$ #{format('%.2f', custo_chapa)}\n" \
                "• Custo estimado dos trilhos: R$ #{format('%.2f', custo_trilho)}\n" \
                "• TOTAL: R$ #{format('%.2f', custo_chapa + custo_trilho)}\n\n" \
                "PRÓXIMA VERSÃO: usinagem 35mm da dobradiça em DXF + plano de corte."
          ::UI.messagebox(msg)
        rescue => e
          model.abort_operation
          raise e
        end
      end

      private

      # Área destinada às gavetas (30% da altura por padrão, ~50cm no máximo)
      def gaveta_area_h(h, n_gav)
        target = h * 0.35
        target > 500.mm ? 500.mm : target
      end

      # Estimativa simplificada em m² de chapa consumida
      def estimate_area_m2(h_mm, w_mm, d_mm, t_mm, n_portas, n_gav, n_prat, n_divis)
        # base + topo + 2 laterais + fundo + prateleiras + divisorias + portas + gavetas
        m2 = (
          2 * (w_mm * d_mm) +       # base + topo
          2 * ((h_mm - 2 * t_mm) * d_mm) +  # laterais
          (w_mm * (h_mm - 2 * t_mm)) +      # fundo
          n_prat * ((w_mm - 2 * t_mm) * (d_mm - t_mm)) +
          n_divis * ((d_mm - t_mm) * (h_mm - 2 * t_mm)) +
          n_portas * ((w_mm / [n_portas, 1].max) * h_mm * 0.7) +
          n_gav * (w_mm * (h_mm * 0.15))
        ) / 1_000_000.0
        m2
      end

      def add_box(parent, x, y, z, dx, dy, dz, mat, name)
        return if dx <= 0 || dy <= 0 || dz <= 0
        g = parent.entities.add_group
        g.name = name
        pts = [
          Geom::Point3d.new(x, y, z),
          Geom::Point3d.new(x + dx, y, z),
          Geom::Point3d.new(x + dx, y + dy, z),
          Geom::Point3d.new(x, y + dy, z)
        ]
        face = g.entities.add_face(pts)
        face.reverse! if face.normal.z < 0
        face.pushpull(dz)
        g.material = mat
        g
      end

      def push_presets
        payload = {
          'cores'        => COLOR_PRESETS,
          'puxadores'    => PUXADORES,
          'dobradicas'   => DOBRADICAS,
          'pos_usinagem' => POS_USINAGEM,
          'tipo_gaveta'  => TIPO_GAVETA,
          'tipo_trilho'  => TIPO_TRILHO
        }
        @dlg.execute_script("window.tmfModuloReady(#{payload.to_json})")
      end

      def hex_to_rgb(hex)
        h = hex.sub('#', '')
        return [200, 200, 200] unless h.length == 6
        [h[0, 2].to_i(16), h[2, 2].to_i(16), h[4, 2].to_i(16)]
      end

    end
  end
end
