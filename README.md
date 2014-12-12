# Cloud UI

A comprehensive HTML5 front-end authoring framework built on jQuery and Sass.  Giving the Cloud some UI.

## Requirements

Sass 3.1+ (https://github.com/nex3/sass)
Bourbon (https://github.com/thoughtbot/bourbon)

## Install for Rails

Add this line to your application's Gemfile:

    gem "cloud-ui"

And then run:

    $ bundle install

## Non-Rails

Install the gem:

    $ gem install cloud-ui

## Usage

* Add `@import "cloud-ui";` to the top of your application.scss file.
* Add `@import "cloud-bookend";` to the bottom of your application.scss file.

## Build

Run `bundle exec rake test` to run the tests and build the asset files.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Write and run tests (`rake test`)
6. Create new Pull Request

## Credits

This library has borrowed liberally from Twitter Bootstrap, Bourbon and Jeet.

Contributors include:

* Brant Watrous
