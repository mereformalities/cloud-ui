module Cloud
  module Ui
    class Engine < Rails::Engine
      # auto wire
      initializer "cloud-ui.append_assets_src_path" do |app|
        app.config.assets.paths << File.join(Cloud::Ui.root, 'app', 'assets_src', 'javascripts')
        app.config.assets.paths << File.join(Cloud::Ui.root, 'app', 'assets_src', 'stylesheets')
        # Use `rails console` to debug engines!
        # puts app.config.assets.paths
      end      
    end
  end
end