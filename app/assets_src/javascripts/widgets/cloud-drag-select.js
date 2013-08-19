/*
	@title:
	Drag to Select

	@version:
	1.1

	@author:
	Andreas Lagerkvist

	@date:
	2009-04-06

	@url:
	http://andreaslagerkvist.com/jquery/drag-to-select/

	@license:
	http://creativecommons.org/licenses/by/3.0/

	@copyright:
	2008 Andreas Lagerkvist (andreaslagerkvist.com)

	@requires:
	jquery, jquery.dragToSelect.css

	@does:
	Use this plug-in to allow your users to select certain elements by dragging a "select box". Works very similar to how you can drag-n-select files and folders in most OS:es.

	@howto:
	$('#my-files').dragToSelect(selectables: 'li'); would make every li in the #my-files-element selectable by dragging. The li:s will recieve a "selected"-class when they are within range of the select box when user drops.

	Make sure a parent-element of the selectables has position: relative as well as overflow: auto or scroll.

	@exampleHTML:
	<ul>
		<li><img src="http://exscale.se/__files/3d/lamp-and-mates/lamp-and-mates-01_small.jpg" alt="Lamp and Mates" /></li>
		<li><img src="http://exscale.se/__files/3d/stugan-winter_small.jpg" alt="The Cottage - Winter time" /></li>
		<li><img src="http://exscale.se/__files/3d/ps2_small.jpg" alt="PS2" /></li>
	</ul>

	@exampleJS:
	$('#jquery-drag-to-select-example').dragToSelect({
		selectables: 'li', 
		onHide: function () {
			alert($('#jquery-drag-to-select-example li.selected').length + ' selected');
		}
	});
*/
jQuery.fn.dragToSelect = function (options) {
	// Init options
	options = typeof(options) == 'object' ? options : {};
	
	// Config
	var config = $.extend({
		className:			'drag-select',
		activeClass:		'active',
		disabledClass:		'disabled',
		selectedClass:		'selected',
		threshold: 			3,
		scrollTH:			10,
		percentCovered:		20,
		filter: function (e) {
			return $(e.target).is('a, input');
		},
		selectables:		false,
		autoScroll:			false,
		selectOnMove:		false,
		allowSelection:  	function () { return true; },
		onShow:			 	function () { return true; },
		onHide:			 	function () { return true; },
		onRefresh:		 	function () { return true; },
		onSelectElement: 	function (el) {},
		shouldDeselectElement: 	function (el) { return true; },
		onDeselectElement: 	function (el) {}
	}, options);

	var $el			= $(this);
	var $parent		= $el.parents().filter(function (index) {
		// Skip scrollable elements and stop at body
		return this.nodeName.toLowerCase() !== 'html' && 
			!/auto|scroll|hidden/.test($(this).css('overflow'));
	}).last();

	/*do {
		if (/auto|scroll|hidden/.test($parent.css('overflow'))) {
			break;
		}
		$parent = $parent.parent();
		if (!$parent[0]) {
			return;
		}
	} while ($parent[0].parentNode);*/

	// Did user pass in disable?
	if (options === 'disable') {
		$el.addClass(config.disabledClass);
		return this;
	}
	// Did user pass in enable?
	else if (options === 'enable') {
		$el.removeClass(config.disabledClass);
		return this;
	}

	var parentOffset	= $parent.offset();
	var parentDim		= {
		left:	parentOffset.left, 
		top:	parentOffset.top, 
		width:	$parent.width(), 
		height:	$parent.height()
	};

	// Var to track a click to examine
	var didClick = false;

	// Var to check active state
	var active = false;

	// Current origin of select box
	var selectBoxOrigin = {
		left:	0, 
		top:	0
	};

	// Create select box
	var selectBox = $('<div/>')
						.appendTo($parent)
						//.css('position', 'absolute')
						.attr('class', config.className);
						
	// Current dimensions
	/*var parentDimens = function () {
		var parentOffset = $parent.offset();
		return {
			left:	parentOffset.left, 
			top:	parentOffset.top, 
			width:	$parent.width(), 
			height:	$parent.height()
		};
	};*/

	// Resets the select box to mouse position
	var resetSelectBox = function (e) {
		selectBoxOrigin.left = e.pageX - parentDim.left; // + $parent[0].scrollLeft;
		selectBoxOrigin.top	 = e.pageY - parentDim.top; // + $parent[0].scrollTop;
	};
	
	// Check if user dragged mouse beyond threshold
	var draggedFarEnough = function (e) {
		var left		= e.pageX - parentDim.left; // + $parent[0].scrollLeft;
		var top			= e.pageY - parentDim.top; // + $parent[0].scrollTop;
		
		return Math.abs(left - selectBoxOrigin.left) > config.threshold ||
			   Math.abs(top - selectBoxOrigin.top) > config.threshold;
	};

	// Shows the select box
	var showSelectBox = function (e) {
		// resetSelectBox();
		var css = {
			left:		selectBoxOrigin.left + 'px', 
			top:		selectBoxOrigin.top + 'px', 
			width:		'1px', 
			height:		'1px'
		};
		selectBox.addClass(config.activeClass).css(css);
		active = true;
		config.onShow();
	};

	// Refreshes the select box dimensions and possibly position
	var refreshSelectBox = function (e) {
		if (!selectBox.is('.' + config.activeClass) || $el.is('.' + config.disabledClass)) {
			return;
		}
		
		var left		= e.pageX - parentDim.left; // + $parent[0].scrollLeft;
		var top			= e.pageY - parentDim.top; // + $parent[0].scrollTop;
		var newLeft		= left;
		var newTop		= top;
		var newWidth	= selectBoxOrigin.left - newLeft;
		var newHeight	= selectBoxOrigin.top - newTop;

		if (left > selectBoxOrigin.left) {
			newLeft		= selectBoxOrigin.left;
			newWidth	= left - selectBoxOrigin.left;
		}
		if (top > selectBoxOrigin.top) {
			newTop		= selectBoxOrigin.top;
			newHeight	= top - selectBoxOrigin.top;
		}
		var css = {
			left:	newLeft + 'px', 
			top:	newTop + 'px', 
			width:	newWidth + 'px', 
			height:	newHeight + 'px'
		};
		selectBox.css(css);
		config.onRefresh();
	};

	// Hides the select box
	var hideSelectBox = function (e) {
		if (!selectBox.is('.' + config.activeClass) || $parent.is('.' + config.disabledClass)) {
			return;
		}
		if (config.onHide(selectBox) !== false) {
			selectBox.removeClass(config.activeClass);
			active = false;
		}
	};

	// Scroll parent if needed 
	// FIX: Not working in Firefox
	var scrollPerhaps = function (e) {
		if (!selectBox.is('.' + config.activeClass) || $parent.is('.' + config.disabledClass)) {
			return;
		}
		// Scroll down
		if ((e.pageY + config.scrollTH) > (parentDim.top + parentDim.height)) {
			$parent[0].scrollTop += config.scrollTH;
		}
		// Scroll up
		if ((e.pageY - config.scrollTH) < parentDim.top) {
			$parent[0].scrollTop -= config.scrollTH;
		}
		// Scroll right
		if ((e.pageX + config.scrollTH) > (parentDim.left + parentDim.width)) {
			$parent[0].scrollLeft += config.scrollTH;
		}
		// Scroll left
		if ((e.pageX - config.scrollTH) < parentDim.left) {
			$parent[0].scrollLeft -= config.scrollTH;
		}
	};

	// Selects all the elements in the select box's range
	var selectElementsInRange = function () {
		if (!selectBox.is('.' + config.activeClass) || $parent.is('.' + config.disabledClass)) {
			return;
		}

		var selectables		= $el.find(config.selectables).filter(':visible');
		var selectBoxOffset	= selectBox.offset();
		var selectBoxDim	= {
			left:	selectBoxOffset.left, 
			top:	selectBoxOffset.top, 
			width:	selectBox.width(), 
			height:	selectBox.height()
		};

		var el, elOffset, elDim;
		selectables.each(function (index) {
			el			= $(this);
			//if (!el.is(':visible')) { return; }
			elOffset	= el.offset();
			elDim		= {
				left:	elOffset.left, 
				top:	elOffset.top, 
				width:	el.width(), 
				height:	el.height()
			};
			
			// TODO: Trigger 'selected' event?
			if (percentCovered(selectBoxDim, elDim) > config.percentCovered) {
				el.addClass(config.selectedClass);
				config.onSelectElement(el);
			}
			else if (el.hasClass(config.selectedClass)) {
				if (config.shouldDeselectElement(el)) {
					el.removeClass(config.selectedClass);
					config.onDeselectElement(el);
				}
			}
		});
	};

	// Returns the amount (in %) that dim1 covers dim2
	var percentCovered = function (dim1, dim2) {
		// The whole thing is covering the whole other thing
		if (
			(dim1.left <= dim2.left) && 
			(dim1.top <= dim2.top) && 
			((dim1.left + dim1.width) >= (dim2.left + dim2.width)) && 
			((dim1.top + dim1.height) > (dim2.top + dim2.height))
		) {
			return 100;
		}
		// Only parts may be covered, calculate percentage
		else {
			dim1.right		= dim1.left + dim1.width;
			dim1.bottom		= dim1.top + dim1.height;
			dim2.right		= dim2.left + dim2.width;
			dim2.bottom		= dim2.top + dim2.height;

			var l = Math.max(dim1.left, dim2.left);
			var r = Math.min(dim1.right, dim2.right);
			var t = Math.max(dim1.top, dim2.top);
			var b = Math.min(dim1.bottom, dim2.bottom);

			if (b >= t && r >= l) {
				var percent = (((r - l) * (b - t)) / (dim2.width * dim2.height)) * 100;
				return percent;
			}
		}
		// Nothing covered, return 0
		return 0;
	};

	// Handle events on select box
	selectBox
		.mousemove(function (e) {
			refreshSelectBox(e);

			if (config.selectables && config.selectOnMove) {			
				selectElementsInRange();
			}

			if (config.autoScroll) {
				scrollPerhaps(e);
			}
			// e.preventDefault();
		})
		.mouseup(function(e) {
			if (config.selectables) {			
				selectElementsInRange();
			}

			didClick = false;
			hideSelectBox(e);
			// e.preventDefault();
		});

	// This is looking for a plugin named 'disableTextSelect'
	if ($.fn.disableTextSelect) {
		$parent.disableTextSelect();
	}

	// Handle events on the container
	$parent
		.mousedown(function (e) {
			// Only use primary mouse button click (http://stackoverflow.com/a/2725963)
			if (e.which > 1) {
				return;
			}
			// Make sure user isn't clicking scrollbar (or disallow clicks far to the right actually)
			if ((e.pageX + 20) > $(document.body).width()) {
				return;
			}
			 // Allow click propogration to a, input or .btn
			if (!config.allowSelection() || config.filter(e) || $(e.target).isPartOf(config.selectables)) {
				return;
			}
			// Check for disabled class
			if ($el.is('.' + config.disabledClass)) {
				return;
			}
			
			didClick = true;
			resetSelectBox(e);
			// showSelectBox(e);
			// e.preventDefault();
		})
		.mousemove(function (e) {
			// Mouse still down?
			// TODO: Set timeout in case mouse goes off-screen
			
			// Must drag beyond threshold to activate
			if (didClick && !active && draggedFarEnough(e)) {
				showSelectBox(e);
				return;
			}
			refreshSelectBox(e);

			if (config.selectables && config.selectOnMove) {			
				selectElementsInRange();
			}

			if (config.autoScroll) {
				scrollPerhaps(e);
			}

			//e.preventDefault();
		})
		.mouseup(function (e) {
			if (config.selectables) {			
				selectElementsInRange();
			}
			// Allows event to propogate
			setTimeout(function () {
				didClick = false;
				hideSelectBox(e);
			}, 100);
			// e.preventDefault();
		});

	// Be nice
	return this;
};