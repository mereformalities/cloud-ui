# Configure Rails Envinronment
ENV["RAILS_ENV"] = "test"

require 'rails'
require 'sass'
require "rails/test_help"

def assets_src
  "#{File.dirname(__FILE__)}/../app/assets_src"
end

def vendor_path
  "#{File.dirname(__FILE__)}/../vendor"
end

def output_path
  "#{File.dirname(__FILE__)}/../docs/assets"
end

def tmp_path
  "#{File.dirname(__FILE__)}/tmp"
end