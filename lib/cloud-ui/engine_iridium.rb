module Cloud
  module Ui
    class Engine < Iridium::Engine
      # auto wire
      configure do
        # Tell Compass to incorporate our sass files
        config.compass.additional_import_paths ||= []
        config.compass.additional_import_paths << File.join(Cloud::Ui.root, 'app', 'assets_src', 'stylesheets')
        # Tell Iridium to include our js as vendored javascript
        paths[:vendored_javascripts].add File.join(Cloud::Ui.root, 'vendor', 'javascripts')
        paths[:vendored_javascripts].add File.join(Cloud::Ui.root, 'app', 'assets_src', 'javascripts')
      end
    end
  end
end