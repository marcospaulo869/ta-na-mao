# encoding: UTF-8
# ---------------------------------------------------------------------------
# Main menu registration for the Tudo Mais Fácil extension.
# ---------------------------------------------------------------------------

require 'sketchup.rb'
require 'json'
require File.join(File.dirname(__FILE__), 'generator')
require File.join(File.dirname(__FILE__), 'loader')
require File.join(File.dirname(__FILE__), 'dialog')
require File.join(File.dirname(__FILE__), 'lastro')
require File.join(File.dirname(__FILE__), 'modulo')

module TudoMaisFacil
  module UI

    def self.add_menus
      return if @menus_loaded
      @menus_loaded = true

      menu = ::UI.menu('Extensions').add_submenu('Tudo Mais Fácil — Madeira Forte')

      menu.add_item('Importar Parede (arquivo local)…') { import_from_file }
      menu.add_item('Importar Parede (da nuvem)…')      { open_cloud_picker }
      menu.add_separator
      menu.add_item('🪵 Lastro de Cozinha…')             { TudoMaisFacil::Lastro.show_wizard }
      menu.add_item('📦 Construtor de Módulos…')         { TudoMaisFacil::Modulo.show_wizard }
      menu.add_separator
      menu.add_item('Configurar URL do App…')           { configure_api }
      menu.add_item('Sobre')                            { show_about }

      # Also add a toolbar for quick access
      toolbar = ::UI::Toolbar.new('Tudo Mais Fácil')

      # Icons live next to this file — resolve relative to __FILE__ so the
      # path works regardless of what PLUGIN_ROOT was set to.
      ui_dir = File.join(File.dirname(__FILE__), 'ui')
      icon_file   = File.join(ui_dir, 'icon_import_file.png')
      icon_cloud  = File.join(ui_dir, 'icon_import_cloud.png')
      icon_lastro = File.join(ui_dir, 'icon_lastro.png')
      icon_modulo = File.join(ui_dir, 'icon_modulo.png')
      # 24×24 small versions (SketchUp uses these when toolbar is in small mode)
      icon_file_s   = File.join(ui_dir, 'icon_import_file_24.png')
      icon_cloud_s  = File.join(ui_dir, 'icon_import_cloud_24.png')
      icon_lastro_s = File.join(ui_dir, 'icon_lastro_24.png')
      icon_modulo_s = File.join(ui_dir, 'icon_modulo_24.png')

      cmd_local = ::UI::Command.new('Importar Parede (arquivo)') { import_from_file }
      cmd_local.tooltip         = 'Importar arquivo .tmf.json'
      cmd_local.status_bar_text = 'Selecione um arquivo .tmf.json exportado pelo app Tudo Mais Fácil'
      cmd_local.small_icon      = icon_file_s
      cmd_local.large_icon      = icon_file
      toolbar.add_item(cmd_local)

      cmd_cloud = ::UI::Command.new('Importar Parede (nuvem)') { open_cloud_picker }
      cmd_cloud.tooltip         = 'Importar direto da sua conta na nuvem'
      cmd_cloud.status_bar_text = 'Lista suas paredes salvas na nuvem e importa'
      cmd_cloud.small_icon      = icon_cloud_s
      cmd_cloud.large_icon      = icon_cloud
      toolbar.add_item(cmd_cloud)

      cmd_lastro = ::UI::Command.new('Lastro de Cozinha') { TudoMaisFacil::Lastro.show_wizard }
      cmd_lastro.tooltip         = 'Gerar base de madeira (lastro) sob módulos de cozinha'
      cmd_lastro.status_bar_text = 'Abrir assistente do Lastro de Cozinha'
      cmd_lastro.small_icon      = icon_lastro_s
      cmd_lastro.large_icon      = icon_lastro
      toolbar.add_item(cmd_lastro)

      cmd_modulo = ::UI::Command.new('Construtor de Módulos') { TudoMaisFacil::Modulo.show_wizard }
      cmd_modulo.tooltip         = 'Criar módulo planejado parametrizado'
      cmd_modulo.status_bar_text = 'Abrir assistente do Construtor de Módulos'
      cmd_modulo.small_icon      = icon_modulo_s
      cmd_modulo.large_icon      = icon_modulo
      toolbar.add_item(cmd_modulo)

      toolbar.show
    end

    def self.import_from_file
      path = ::UI.openpanel(
        'Selecione o arquivo exportado (.tmf.json)',
        '',
        'JSON do Tudo Mais Fácil|*.tmf.json;*.json||'
      )
      return unless path && File.exist?(path)

      begin
        data = JSON.parse(File.read(path))
        TudoMaisFacil::Generator.build_from_export(data)
      rescue JSON::ParserError => e
        ::UI.messagebox("Arquivo JSON inválido:\n#{e.message}")
      rescue => e
        ::UI.messagebox("Erro ao importar:\n#{e.message}")
      end
    end

    def self.open_cloud_picker
      TudoMaisFacil::Dialog.show_picker
    end

    def self.configure_api
      current = TudoMaisFacil::Loader.api_base_url
      answer = ::UI.inputbox(
        ['URL base do app (ex: https://seuapp.emergentagent.com)'],
        [current],
        'Configurar URL do App'
      )
      return unless answer
      TudoMaisFacil::Loader.api_base_url = answer.first.strip
      ::UI.messagebox("URL salva:\n#{TudoMaisFacil::Loader.api_base_url}")
    end

    def self.show_about
      msg = "#{TudoMaisFacil::PLUGIN_NAME}\n" \
            "Versão #{TudoMaisFacil::PLUGIN_VERSION}\n\n" \
            "#{TudoMaisFacil::PLUGIN_COPY}\n\n" \
            "Importa medições do app Tudo Mais Fácil e gera modelos 3D " \
            "automaticamente. Realizando Sonhos."
      ::UI.messagebox(msg)
    end

  end
end

TudoMaisFacil::UI.add_menus
