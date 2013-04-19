require 'test_helper'

class AssetsTest < ActiveSupport::TestCase

  def setup
    require "rails"
    require "action_controller/railtie"
    require "sprockets/railtie" # in rails edge: sprockets/rails/railtie
    require "uglifier"

    @app = Class.new(Rails::Application)
    @app.config.active_support.deprecation = :stderr
    @app.config.assets.enabled = true
    @app.config.assets.compress = false
    @app.config.assets.paths << File.join(vendor_path, "javascripts")
    @app.config.assets.paths << assets_src
    @app.config.assets.cache_store = [ :file_store, "#{tmp_path}/cache" ]
    @app.paths["log"] = "#{tmp_path}/log/test.log"
    @app.initialize!
  end

  def teardown
    FileUtils.rm_rf "#{tmp_path}/cache"
    FileUtils.rm_rf "#{tmp_path}/log"
  end

  # Cleaner approach:
  # http://www.simonecarletti.com/blog/2011/09/using-sprockets-without-a-railsrack-project/
  
  test "cloud-ui Javascripts are included in Sprockets environment" do
    %w(cloud-vendor cloud-ui).each do |file|
      assert_nothing_raised do
        content = @app.assets["javascripts/#{file}.js"]
        File.open("#{output_path}/#{file}.js", 'w') { |f| f.write(content) }
      end
    end
  end
end