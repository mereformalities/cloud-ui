Rails.application.routes.draw do
  match "/style_guide" => "demo#index", :as => :style_guide
end