module Cloud::Ui::SassExtensions::Functions::Colors
  
  # Finds the color at the given interval between two other colors
  def interval(color0, color1, interval = Sass::Script::Number.new(50))
    if color0.value == "transparent"
      color0 = Sass::Script::Color.new([255, 255, 255, 0])
    end
    if color1.value == "transparent"
      color1 = Sass::Script::Color.new([0, 0, 0, 0])
    end
    assert_type color0, :Color
    assert_type color1, :Color
    assert_type interval, :Number
    unless (0..100).include?(interval.value)
      raise ArgumentError.new("Scale #{interval} must be between 0% and 100%")
    end
    mix(color0, color1, Sass::Script::Number.new(100-interval.value))
  end

end