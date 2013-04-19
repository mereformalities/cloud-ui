class DemoController < ApplicationController
  layout false

  respond_to :js
  # caches_page :data

  def index
    render
  end
end