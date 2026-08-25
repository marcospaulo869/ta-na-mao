# encoding: UTF-8
# ---------------------------------------------------------------------------
# Loader — fetches walls from the Tudo Mais Fácil cloud API.
# Uses Net::HTTP (stdlib) so it works with vanilla SketchUp Ruby.
# ---------------------------------------------------------------------------

require 'sketchup.rb'
require 'net/http'
require 'json'
require 'uri'

module TudoMaisFacil
  module Loader

    DEFAULT_API_URL = 'https://sketch-toolkit-1.preview.emergentagent.com'.freeze
    PREF_KEY = 'tmf_api_base_url'.freeze

    class << self

      def api_base_url
        stored = Sketchup.read_default('TudoMaisFacil', PREF_KEY, DEFAULT_API_URL)
        stored.to_s.strip.chomp('/')
      end

      def api_base_url=(url)
        Sketchup.write_default('TudoMaisFacil', PREF_KEY, url.to_s.strip.chomp('/'))
      end

      def list_walls
        get_json('/api/walls')
      end

      def export_wall(wall_id)
        get_json("/api/walls/#{wall_id}/export")
      end

      private

      def get_json(path)
        uri = URI.parse("#{api_base_url}#{path}")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = (uri.scheme == 'https')
        http.read_timeout = 20

        req = Net::HTTP::Get.new(uri.request_uri)
        req['Accept'] = 'application/json'

        res = http.request(req)
        raise "HTTP #{res.code}: #{res.body}" unless res.is_a?(Net::HTTPSuccess)
        JSON.parse(res.body)
      end

    end
  end
end
