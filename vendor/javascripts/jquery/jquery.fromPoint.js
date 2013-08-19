// Source: https://gist.github.com/larscwallin/1528591

(function ($) {
	
	"use strict"; // jshint ;_;
 
	$.elementFromPoint = function (x, y) {
		var check = false, 
			isRelative = true,
			sl;
			
    	if (!document.elementFromPoint) {
			return null;
		}

		if (!check) {
			if ((sl = $(document).scrollTop()) > 0) {
       			isRelative = (document.elementFromPoint(0, sl + $(window).height() -1) === null);
      		}
      		else if ((sl = $(document).scrollLeft()) > 0) {
       			isRelative = (document.elementFromPoint(sl + $(window).width() -1, 0) === null);
      		}
      		check = (sl > 0);
    	}
 
    	if (!isRelative) {
      		x += $(document).scrollLeft();
      		y += $(document).scrollTop();
		}
 		return document.elementFromPoint(x,y);
	};
	
	$.fromPoint = function (x, y) {
		return $($.elementFromPoint(x, y));
	};
 
}(jQuery));