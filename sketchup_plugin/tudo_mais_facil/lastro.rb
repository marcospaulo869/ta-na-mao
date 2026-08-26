# encoding: UTF-8
# ---------------------------------------------------------------------------
# Lastro de Cozinha — 1º plugin da linha Marcenaria.
# Gera uma base retangular de madeira (base sob módulos de cozinha) usando
# dimensões e tipo de madeira informados via HtmlDialog.
# ---------------------------------------------------------------------------

require 'sketchup.rb'
require 'json'

module TudoMaisFacil
  module Lastro

    class << self

      # --- WOOD PRESETS ---------------------------------------------------
      WOOD_PRESETS = {
        'pinus_tratado' => {
          'nome'   => 'Pinus Tratado',
          'cor'    => '#c9a26a',
          'valor'  => 45.0 # R$/m linear default (usuário edita)
        },
        'grapia' => {
          'nome'   => 'Grapia (madeira de lei)',
          'cor'    => '#8b5a2b',
          'valor'  => 180.0
        }
      }.freeze

      def show_wizard
        html_path = File.join(TudoMaisFacil::PLUGIN_ROOT, 'ui', 'lastro.html')

        @dlg = ::UI::HtmlDialog.new(
          dialog_title:    'Lastro de Cozinha — Tudo Mais Fácil',
          preferences_key: 'tmf_lastro',
          scrollable:      true,
          resizable:       true,
          width:           560,
          height:          720,
          style:           ::UI::HtmlDialog::STYLE_DIALOG
        )
        @dlg.set_file(html_path)

        @dlg.add_action_callback('ready') do |_ctx|
          push_presets
        end

        @dlg.add_action_callback('build') do |_ctx, payload_json|
          begin
            params = JSON.parse(payload_json)
            build_lastro(params)
          rescue => e
            ::UI.messagebox("Erro ao gerar lastro:\n#{e.message}")
          end
        end

        @dlg.add_action_callback('close') do |_ctx|
          @dlg.close if @dlg
        end

        @dlg.show
      end

      # --- 3D BUILDER -----------------------------------------------------
      # params (all in mm):
      #   comprimento, altura, espessura, tipo_madeira, valor_metro
      def build_lastro(params)
        comprimento = params['comprimento'].to_f
        altura      = params['altura'].to_f
        espessura   = params['espessura'].to_f
        tipo        = params['tipo_madeira']
        valor_metro = params['valor_metro'].to_f

        if comprimento <= 0 || altura <= 0 || espessura <= 0
          ::UI.messagebox('Informe comprimento, altura e espessura maiores que zero.')
          return
        end

        preset = WOOD_PRESETS[tipo] || WOOD_PRESETS['pinus_tratado']

        model = Sketchup.active_model
        model.start_operation('Lastro de Cozinha', true)

        begin
          group = model.entities.add_group
          group.name = "Lastro (#{preset['nome']})"

          # Base rectangle on XY plane at Z = 0
          pts = [
            Geom::Point3d.new(0, 0, 0),
            Geom::Point3d.new(comprimento.mm, 0, 0),
            Geom::Point3d.new(comprimento.mm, espessura.mm, 0),
            Geom::Point3d.new(0, espessura.mm, 0)
          ]
          face = group.entities.add_face(pts)
          face.reverse! if face.normal.z < 0
          face.pushpull(altura.mm)

          # Apply wood-like material
          mat = model.materials["TMF Lastro #{tipo}"] || model.materials.add("TMF Lastro #{tipo}")
          mat.color = Sketchup::Color.new(hex_to_rgb(preset['cor']))
          group.material = mat

          # Add attributes for later cost estimate
          group.set_attribute('tmf', 'kind', 'lastro')
          group.set_attribute('tmf', 'tipo_madeira', tipo)
          group.set_attribute('tmf', 'comprimento_mm', comprimento)
          group.set_attribute('tmf', 'altura_mm', altura)
          group.set_attribute('tmf', 'espessura_mm', espessura)
          group.set_attribute('tmf', 'valor_metro', valor_metro)

          model.commit_operation
          model.active_view.zoom(group)

          # Cost estimate (linear meters × price)
          metros = comprimento / 1000.0
          custo  = (metros * valor_metro).round(2)

          summary = "Lastro criado!\n\n" \
                    "• Madeira: #{preset['nome']}\n" \
                    "• Comprimento: #{comprimento.to_i} mm (#{format('%.2f', metros)} m)\n" \
                    "• Altura: #{altura.to_i} mm\n" \
                    "• Espessura: #{espessura.to_i} mm\n" \
                    "• Valor por metro: R$ #{format('%.2f', valor_metro)}\n" \
                    "• Custo estimado: R$ #{format('%.2f', custo)}"
          ::UI.messagebox(summary)
        rescue => e
          model.abort_operation
          raise e
        end
      end

      private

      def push_presets
        payload = { 'presets' => WOOD_PRESETS }
        @dlg.execute_script("window.tmfLastroReady(#{payload.to_json})")
      end

      def hex_to_rgb(hex)
        h = hex.sub('#', '')
        return [200, 200, 200] unless h.length == 6
        [h[0, 2].to_i(16), h[2, 2].to_i(16), h[4, 2].to_i(16)]
      end

    end
  end
end
