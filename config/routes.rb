Rails.application.routes.draw do
  get "/style_guide" => "demo#index", :as => :style_guide
end