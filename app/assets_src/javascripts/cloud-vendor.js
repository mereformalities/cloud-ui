// This idea is quickly becoming a genericized Javascript and Sass module
// manager and compiler.  I may need to keep alternate source files with
// minispade require headers, or opt for something more like Google's
// Closure system.  I want to be able to specify not only vendor libraries
// as dependencies, but individual modules.  I would also like to be able to
// show which libraries and modules are interchangable. Is that so hard? =)
//
// Buy advancejs.com! Keep internally-consistent versions of popular plugins
// that add specific functionality without adding duplicate code.  Make
// platform-wide assumptions (handlebars, compilation, zepto|jquery), and
// allow the user to specify their compatibility requirements (mobile, ie).
// Create multiple builds to target mobile vs desktop!  Lazily run Javascript
// code and lazily download UI modules (templates).
// (quiltjs.com?)
//
// Stylegiid can be the demo site for this platform.
//
//  require_tree ./vendor
//  require_tree ./vendor-plugins
//  require ./vendor/jquery-1.8.1.min
//
//= require_tree ../../../vendor/javascripts