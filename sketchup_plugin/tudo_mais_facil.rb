# encoding: UTF-8
# ---------------------------------------------------------------------------
# TÁ NA MÃO — Medidas · 3D · Marcenaria
# SketchUp Extension entry point (loaded automatically by SketchUp)
# ---------------------------------------------------------------------------

require 'sketchup.rb'
require 'extensions.rb'

module TudoMaisFacil
  PLUGIN_ID       = 'tudo_mais_facil'.freeze
  PLUGIN_NAME     = 'Tá Na Mão'.freeze
  PLUGIN_VERSION  = '1.3.0'.freeze
  PLUGIN_CREATOR  = 'Tá Na Mão'.freeze
  PLUGIN_COPY     = '© 2026 Tá Na Mão · Medidas em um toque'.freeze
  PLUGIN_ROOT     = File.dirname(__FILE__).freeze

  unless file_loaded?(__FILE__)
    ext = SketchupExtension.new(PLUGIN_NAME, File.join(PLUGIN_ROOT, 'tudo_mais_facil', 'main.rb'))
    ext.description = 'Importa medições de ambientes do app Tá Na Mão ' \
                      'e gera automaticamente paredes 3D com aberturas, ' \
                      'colunas, vigas e pontos elétricos/hidráulicos no SketchUp.'
    ext.version   = PLUGIN_VERSION
    ext.creator   = PLUGIN_CREATOR
    ext.copyright = PLUGIN_COPY
    Sketchup.register_extension(ext, true)
    file_loaded(__FILE__)
  end
end
