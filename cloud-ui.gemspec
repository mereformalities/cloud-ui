# -*- encoding: utf-8 -*-
require File.expand_path('../lib/cloud-ui/version', __FILE__)

Gem::Specification.new do |gem|
  gem.name          = 'cloud-ui'
  gem.version       = Cloud::Ui::VERSION
  gem.platform      = Gem::Platform::RUBY
  gem.authors       = ["Brant Watrous"]
  gem.email         = ["watroubd@gmail.com"]
  gem.homepage      = 'http://cloud-ui.com/'
  gem.summary       = 'Front-end toolset for web applications'
  gem.description   = 'A comprehensive HTML5 front-end toolset built on jQuery/Zepto and SASS'

  gem.files         = `git ls-files`.split($\)
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.require_paths = ["lib"]

  # gem.add_dependency('railties', '>= 3.0.19')
  # gem.add_dependency('actionpack', '>= 3.0.19')
  # gem.add_dependency('sass-rails', '~> 3.1')
  # gem.add_dependency('coffee-script', '>= 2.2.0')
  # gem.add_dependency('uglifier', '>= 1.0.3')
end
