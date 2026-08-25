# encoding: UTF-8
# ---------------------------------------------------------------------------
# TUDO MAIS FÁCIL — Madeira Forte Planejados
# SketchUp Extension entry point (loaded automatically by SketchUp)
# ---------------------------------------------------------------------------

require 'sketchup.rb'
require 'extensions.rb'

module TudoMaisFacil
  PLUGIN_ID       = 'tudo_mais_facil'.freeze
  PLUGIN_NAME     = 'Tudo Mais Fácil — Madeira Forte'.freeze
  PLUGIN_VERSION  = '1.0.0'.freeze
  PLUGIN_CREATOR  = 'Madeira Forte Planejados'.freeze
  PLUGIN_COPY     = '© 2026 Madeira Forte — Realizando Sonhos'.freeze
  PLUGIN_ROOT     = File.dirname(__FILE__).freeze

  unless file_loaded?(__FILE__)
    ext = SketchupExtension.new(PLUGIN_NAME, File.join(PLUGIN_ROOT, 'tudo_mais_facil', 'main.rb'))
    ext.description = 'Importa medições de ambientes do app Tudo Mais Fácil ' \
                      'e gera automaticamente paredes 3D com aberturas, ' \
                      'colunas, vigas e pontos elétricos/hidráulicos no SketchUp.'
    ext.version   = PLUGIN_VERSION
    ext.creator   = PLUGIN_CREATOR
    ext.copyright = PLUGIN_COPY
    Sketchup.register_extension(ext, true)
    file_loaded(__FILE__)
  end
end
