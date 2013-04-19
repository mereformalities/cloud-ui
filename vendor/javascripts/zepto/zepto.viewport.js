/*
 * Viewport - Zepto viewport functions
 *
 * Copyright (c) 2007-2012 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://appelsiini.net/projects/viewport
 *
 * Version:  1.7.2
 */
(function($, window) {

	var $window = $(window);
	var settings = {
		threshold: 0,
		container: window
	}
	
	function mergeSettings(options) {
		var merged = {};
		for (var k in settings) merged[k] = settings[k];
		$.extend(merged, options);
		return merged;
	}
	
	function useWindow(options) {
		return options.container === undefined || options.container === window;
	}
	/*
	 * Usage:  $.belowTheFold(element, {threshold: 100, container: window})
	 *
	 * TODO: Rewrite using a central function returning flags for each boundary
	 * TODO: I can actually use inViewport (with a threshold) for most checks...
	 */
	$.belowTheFold = function(element, options) {
		options = mergeSettings(options);
		var fold = useWindow(options) ? $window.height() + $window.scrollTop() : $(options.container).offset().top + $(options.container).height();
		return fold <= $(element).offset().top - options.threshold;
	};

	$.rightOfFold = function(element, options) {
		options = mergeSettings(options);
		var fold = useWindow(options) ? $window.width() + $window.scrollLeft() : $(options.container).offset().left + $(options.container).width();
		return fold <= $(element).offset().left - options.threshold;
	};

	$.aboveTheTop = function(element, options) {
		options = mergeSettings(options);
		var fold = useWindow(options) ? $window.scrollTop() : $(options.container).offset().top;
		return fold >= $(element).offset().top + options.threshold + $(element).height();
	};

	$.leftOfEdge = function(element, options) {
		options = mergeSettings(options);
		var fold = useWindow(options) ? $window.scrollLeft() : $(options.container).offset().left;
		return fold >= $(element).offset().left + options.threshold + $(element).width();
	};

	$.inViewport = function(element, options) {
		 return !$.rightOfFold(element, options) && !$.aboveTheTop(element, options) &&
				!$.leftOfEdge(element, options)  && !$.belowTheFold(element, options);
	 };
	
	/*$.distanceFromViewport = function (element, options) {
		options = mergeSettings(options);
		var inWindow = useWindow(options);
		if ($.aboveTheTop(element, options)) {
			var fold = inWindow ? $window.scrollTop() : $(options.container).offset().top;
			return fold - ($(element).offset().top + $(element).height());
		} 
		else if ($.belowTheFold(element, options)) {
			var fold = inWindow ? $window.height() + $window.scrollTop() : $(options.container).offset().top + $(options.container).height();
			return $(element).offset().top - fold;
		}
		return 0;
	};*/

})(window.jQuery || window.Zepto, window);
