if defined?(Rails)
  require 'active_support'
  require 'action_controller'
  require 'active_record'
end

# http://stackoverflow.com/questions/2900370/why-does-ruby-
# 1-9-2-remove-from-load-path-and-whats-the-alternative
require_relative "cloud-ui/version"

module Cloud
  module Ui
    
    def self.root
      File.expand_path '../..', __FILE__
    end

    if defined?(Iridium) && defined?(Iridium::Engine)
      class Engine < ::Iridium::Engine
        require 'cloud-ui/engine_iridium'
      end
    end
    
    if defined?(Rails) && defined?(Rails::Engine)
      class Engine < ::Rails::Engine
        require 'cloud-ui/engine_rails'
      end
    end
  end
end

require File.join(File.dirname(__FILE__), "/cloud-ui/sass_extensions")