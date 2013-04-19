(function ($) {

	$.isCollection = function (obj) {
		return ($.zepto !== undefined) ? $.zepto.isZ(obj) : obj instanceof jQuery;		
	}
	
	$.fn.exists = function () {
		return $(this).length > 0
	}
	
	$.fn.isChildOf = function (sel) {
		return $(this).parents(sel).length > 0
	}
	
	// http://www.ddrewdesign.com/blog/jquery-is-or-is-child-of-function
	// if (!$(e.target).isPartOf('#context-menu')) { /* Hit */ }
	$.fn.isPartOf = function (sel) {
	    return $(this).is(sel) || $(this).isChildOf(sel)
	}

})(window.jQuery || window.Zepto);