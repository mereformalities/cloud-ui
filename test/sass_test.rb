require 'test_helper'

class CompilationTest < Test::Unit::TestCase
  def test_compilation
    path = 'app/assets_src/stylesheets'
    %w(cloud-default cloud-responsive).each do |file|
      engine = Sass::Engine.for_file("#{path}/#{file}.css.scss", syntax: :scss, load_paths: [path])
      assert_nothing_raised do
        File.open("#{output_path}/#{file}.css", 'w') { |f| f.write(engine.render) }
      end
    end
  end
end