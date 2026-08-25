# encoding: UTF-8
# ---------------------------------------------------------------------------
# Dialog — HtmlDialog that lists cloud walls and imports selected one.
# ---------------------------------------------------------------------------

require 'sketchup.rb'

module TudoMaisFacil
  module Dialog

    class << self

      def show_picker
        html_path = File.join(TudoMaisFacil::PLUGIN_ROOT, 'ui', 'picker.html')

        @dlg = ::UI::HtmlDialog.new(
          dialog_title:    'Importar da Nuvem — Tudo Mais Fácil',
          preferences_key: 'tmf_picker',
          scrollable:      true,
          resizable:       true,
          width:           640,
          height:          720,
          style:           ::UI::HtmlDialog::STYLE_DIALOG
        )
        @dlg.set_file(html_path)

        @dlg.add_action_callback('ready') do |_ctx|
          load_walls_and_push
        end

        @dlg.add_action_callback('refresh') do |_ctx|
          load_walls_and_push
        end

        @dlg.add_action_callback('import') do |_ctx, wall_id|
          import_wall(wall_id)
        end

        @dlg.add_action_callback('configure') do |_ctx|
          current = TudoMaisFacil::Loader.api_base_url
          answer = ::UI.inputbox(['URL do App'], [current], 'Configurar URL')
          if answer
            TudoMaisFacil::Loader.api_base_url = answer.first.strip
            load_walls_and_push
          end
        end

        @dlg.show
      end

      private

      def load_walls_and_push
        begin
          walls = TudoMaisFacil::Loader.list_walls
          payload = {
            'ok'      => true,
            'api'     => TudoMaisFacil::Loader.api_base_url,
            'walls'   => walls
          }
          @dlg.execute_script("window.tmfSetData(#{payload.to_json})")
        rescue => e
          payload = {
            'ok'    => false,
            'api'   => TudoMaisFacil::Loader.api_base_url,
            'error' => e.message
          }
          @dlg.execute_script("window.tmfSetData(#{payload.to_json})")
        end
      end

      def import_wall(wall_id)
        begin
          data = TudoMaisFacil::Loader.export_wall(wall_id)
          TudoMaisFacil::Generator.build_from_export(data)
        rescue => e
          ::UI.messagebox("Erro ao importar da nuvem:\n#{e.message}")
        end
      end

    end
  end
end
