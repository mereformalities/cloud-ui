module Cloud::Ui::SassExtensions::Functions
end

require File.join(File.dirname(__FILE__), "/functions/colors")

module Sass::Script::Functions
  include Cloud::Ui::SassExtensions::Functions::Colors
end

# Wierd that this has to be re-included to pick up sub-modules. Ruby bug?
class Sass::Script::Functions::EvaluationContext
  include Sass::Script::Functions
end