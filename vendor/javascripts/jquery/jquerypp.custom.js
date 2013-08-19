(function(window, $, undefined) {
// ## jquery/dom/styles/styles.js

	var getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
		// The following variables are used to convert camelcased attribute names
		// into dashed names, e.g. borderWidth to border-width
		rupper = /([A-Z])/g,
		rdashAlpha = /-([a-z])/ig,
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		},
		// Returns the computed style for an elementn
		getStyle = function( elem ) {
			if ( getComputedStyle ) {
				return getComputedStyle(elem, null);
			}
			else if ( elem.currentStyle ) {
				return elem.currentStyle;
			}
		},
		// Checks for float px and numeric values
		rfloat = /float/i,
		rnumpx = /^-?\d+(?:px)?$/i,
		rnum = /^-?\d/;

	// Returns a list of styles for a given element
	$.styles = function( el, styles ) {
		if (!el ) {
			return null;
		}
		var  currentS = getStyle(el),
			oldName, val, style = el.style,
			results = {},
			i = 0,
			left, rsLeft, camelCase, name;

		// Go through each style
		for (; i < styles.length; i++ ) {
			name = styles[i];
			oldName = name.replace(rdashAlpha, fcamelCase);

			if ( rfloat.test(name) ) {
				name = $.support.cssFloat ? "float" : "styleFloat";
				oldName = "cssFloat";
			}

			// If we have getComputedStyle available
			if ( getComputedStyle ) {
				// convert camelcased property names to dashed name
				name = name.replace(rupper, "-$1").toLowerCase();
				// use getPropertyValue of the current style object
				val = currentS.getPropertyValue(name);
				// default opacity is 1
				if ( name === "opacity" && val === "" ) {
					val = "1";
				}
				results[oldName] = val;
			} else {
				// Without getComputedStyles
				camelCase = name.replace(rdashAlpha, fcamelCase);
				results[oldName] = currentS[name] || currentS[camelCase];

				// convert to px
				if (!rnumpx.test(results[oldName]) && rnum.test(results[oldName]) ) {
					// Remember the original values
					left = style.left;
					rsLeft = el.runtimeStyle.left;

					// Put in the new values to get a computed value out
					el.runtimeStyle.left = el.currentStyle.left;
					style.left = camelCase === "fontSize" ? "1em" : (results[oldName] || 0);
					results[oldName] = style.pixelLeft + "px";

					// Revert the changed values
					style.left = left;
					el.runtimeStyle.left = rsLeft;
				}

			}
		}

		return results;
	};

	/**
	 * @function jQuery.fn.styles
	 * @parent jQuery.styles
	 * @plugin jQuery.styles
	 *
	 * Returns a set of computed styles. Pass the names of the styles you want to
	 * retrieve as arguments:
	 *
	 *      $("div").styles('float','display')
	 *      // -> { cssFloat: "left", display: "block" }
	 *
	 * @param {String} style pass the names of the styles to retrieve as the argument list
	 * @return {Object} an object of `style` : `value` pairs
	 */
	$.fn.styles = function() {
		// Pass the arguments as an array to $.styles
		return $.styles(this[0], $.makeArray(arguments));
	};

	// ## jquery/dom/animate/animate.js


	// Overwrites `jQuery.fn.animate` to use CSS 3 animations if possible

	var
		// The global animation counter
		animationNum = 0,
		// The stylesheet for our animations
		styleSheet = null,
		// The animation cache
		cache = [],
		// Stores the browser properties like transition end event name and prefix
		browser = null,
		// Store the original $.fn.animate
		oldanimate = $.fn.animate,

		// Return the stylesheet, create it if it doesn't exists
		getStyleSheet = function () {
			if(!styleSheet) {
				var style = document.createElement('style');
				style.setAttribute("type", "text/css");
				style.setAttribute("media", "screen");

				document.getElementsByTagName('head')[0].appendChild(style);
				if (!window.createPopup) { /* For Safari */
					style.appendChild(document.createTextNode(''));
				}

				styleSheet = style.sheet;
			}

			return styleSheet;
		},

		//removes an animation rule from a sheet
		removeAnimation = function (sheet, name) {
			for (var j = sheet.cssRules.length - 1; j >= 0; j--) {
				var rule = sheet.cssRules[j];
				// 7 means the keyframe rule
				if (rule.type === 7 && rule.name == name) {
					sheet.deleteRule(j)
					return;
				}
			}
		},

		// Returns whether the animation should be passed to the original $.fn.animate.
		passThrough = function (props, ops) {
			var nonElement = !(this[0] && this[0].nodeType),
				isInline = !nonElement && $(this).css("display") === "inline" && $(this).css("float") === "none";

			for (var name in props) {
				// jQuery does something with these values
				if (props[name] == 'show' || props[name] == 'hide' || props[name] == 'toggle'
					// Arrays for individual easing
					|| $.isArray(props[name])
					// Negative values not handled the same
					|| props[name] < 0
					// unit-less value
					|| name == 'zIndex' || name == 'z-index' || name == 'scrollTop' || name == 'scrollLeft'
					) {
					return true;
				}
			}

			return props.jquery === true || getBrowser() === null ||
				// Animating empty properties
				$.isEmptyObject(props) ||
				// We can't do custom easing
				(ops && ops.length == 4) || (ops && typeof ops[2] == 'string') ||
				// Second parameter is an object - we can only handle primitives
				$.isPlainObject(ops) ||
				// Inline and non elements
				isInline || nonElement;
		},

		// Gets a CSS number (with px added as the default unit if the value is a number)
		cssValue = function(origName, value) {
			if (typeof value === "number" && !$.cssNumber[ origName ]) {
				return value += "px";
			}
			return value;
		},

		// Feature detection borrowed by http://modernizr.com/
		getBrowser = function(){
			if(!browser) {
				var t,
					el = document.createElement('fakeelement'),
					transitions = {
						'transition': {
							transitionEnd : 'transitionEnd',
							prefix : ''
						},
//						'OTransition': {
//							transitionEnd : 'oTransitionEnd',
//							prefix : '-o-'
//						},
//						'MSTransition': {
//							transitionEnd : 'msTransitionEnd',
//							prefix : '-ms-'
//						},
						'MozTransition': {
							transitionEnd : 'animationend',
							prefix : '-moz-'
						},
						'WebkitTransition': {
							transitionEnd : 'webkitAnimationEnd',
							prefix : '-webkit-'
						}
					}

				for(t in transitions){
					if( el.style[t] !== undefined ){
						browser = transitions[t];
					}
				}
			}
			return browser;
		},

		// Properties that Firefox can't animate if set to 'auto':
		// https://bugzilla.mozilla.org/show_bug.cgi?id=571344
		// Provides a converter that returns the actual value
		ffProps = {
			top : function(el) {
				return el.position().top;
			},
			left : function(el) {
				return el.position().left;
			},
			width : function(el) {
				return el.width();
			},
			height : function(el) {
				return el.height();
			},
			fontSize : function(el) {
				return '1em';
			}
		},

		// Add browser specific prefix
		addPrefix = function(properties) {
			var result = {};
			$.each(properties, function(name, value) {
				result[getBrowser().prefix + name] = value;
			});
			return result;
		},

		// Returns the animation name for a given style. It either uses a cached
		// version or adds it to the stylesheet, removing the oldest style if the
		// cache has reached a certain size.
		getAnimation = function(style) {
			var sheet, name, last;

			// Look up the cached style, set it to that name and reset age if found
			// increment the age for any other animation
			$.each(cache, function(i, animation) {
				if(style === animation.style) {
					name = animation.name;
					animation.age = 0;
				} else {
					animation.age += 1;
				}
			});

			if(!name) { // Add a new style
				sheet = getStyleSheet();
				name = "jquerypp_animation_" + (animationNum++);
				// get the last sheet and insert this rule into it
				sheet.insertRule("@" + getBrowser().prefix + "keyframes " + name + ' ' + style,
					(sheet.cssRules && sheet.cssRules.length) || 0);
				cache.push({
					name : name,
					style : style,
					age : 0
				});

				// Sort the cache by age
				cache.sort(function(first, second) {
					return first.age - second.age;
				});

				// Remove the last (oldest) item from the cache if it has more than 20 items
				if(cache.length > 20) {
					last = cache.pop();
					removeAnimation(sheet, last.name);
				}
			}

			return name;
		};

	/**
	 * @function $.fn.animate
	 * @parent $.animate
	 *
	 * Animate CSS properties using native CSS animations, if possible.
	 * Uses the original [$.fn.animate()](http://api.$.com/animate/) otherwise.
	 *
	 * @param {Object} props The CSS properties to animate
	 * @param {Integer|String|Object} [speed=400] The animation duration in ms.
	 * Will use $.fn.animate if a string or object is passed
	 * @param {Function} [callback] A callback to execute once the animation is complete
	 * @return {jQuery} The jQuery element
	 */
	$.fn.animate = function (props, speed, easing, callback) {
		//default to normal animations if browser doesn't support them
		if (passThrough.apply(this, arguments)) {
			return oldanimate.apply(this, arguments);
		}

		var optall = $.speed(speed, easing, callback);

		// Add everything to the animation queue
		this.queue(optall.queue, function(done) {
			var
				//current CSS values
				current,
				// The list of properties passed
				properties = [],
				to = "",
				prop,
				self = $(this),
				duration = optall.duration,
				//the animation keyframe name
				animationName,
				// The key used to store the animation hook
				dataKey,
				//the text for the keyframe
				style = "{ from {",
				// The animation end event handler.
				// Will be called both on animation end and after calling .stop()
				animationEnd = function (currentCSS, exec) {
					self.css(currentCSS);
					
					self.css(addPrefix({
						"animation-duration" : "",
						"animation-name" : "",
						"animation-fill-mode" : "",
						"animation-play-state" : ""
					}));

					// Call the original callback
					if ($.isFunction(optall.old) && exec) {
						// Call success, pass the DOM element as the this reference
						optall.old.call(self[0], true)
					}

					$.removeData(self, dataKey, true);
				},
				finishAnimation = function() {
					// Call animationEnd using the passed properties
					animationEnd(props, true);
					done();
				};

			for(prop in props) {
				properties.push(prop);
			}

			if(getBrowser().prefix === '-moz-') {
				// Normalize 'auto' properties in FF
				$.each(properties, function(i, prop) {
					var converter = ffProps[$.camelCase(prop)];
					if(converter && self.css(prop) == 'auto') {
						self.css(prop, converter(self));
					}
				});
			}

			// Use $.styles
			current = self.styles.apply(self, properties);
			$.each(properties, function(i, cur) {
				// Convert a camelcased property name
				var name = cur.replace(/([A-Z]|^ms)/g, "-$1" ).toLowerCase();
				style += name + " : " + cssValue(cur, current[cur]) + "; ";
				to += name + " : " + cssValue(cur, props[cur]) + "; ";
			});

			style += "} to {" + to + " }}";

			animationName = getAnimation(style);
			dataKey = animationName + '.run';

			// Add a hook which will be called when the animation stops
			$._data(this, dataKey, {
				stop : function(gotoEnd) {
					// Pause the animation
					self.css(addPrefix({
						'animation-play-state' : 'paused'
					}));
					// Unbind the animation end handler
					self.off(getBrowser().transitionEnd, finishAnimation);
					if(!gotoEnd) {
						// We were told not to finish the animation
						// Call animationEnd but set the CSS to the current computed style
						animationEnd(self.styles.apply(self, properties), false);
					} else {
						// Finish animaion
						animationEnd(props, true);
					}
				}
			});

			// set this element to point to that animation
			self.css(addPrefix({
				"animation-duration" : duration + "ms",
				"animation-name" : animationName,
				"animation-fill-mode": "forwards"
			}));

			// Attach the transition end event handler to run only once
			self.one(getBrowser().transitionEnd, finishAnimation);

		});

		return this;
	};

	// ## jquery/dom/compare/compare.js


/**
 * @function jQuery.fn.compare
 * @parent jQuery.compare
 *
 * Compare two elements and return a bitmask as a number representing the following conditions:
 *
 * - `000000` -> __0__: Elements are identical
 * - `000001` -> __1__: The nodes are in different documents (or one is outside of a document)
 * - `000010` -> __2__: #bar precedes #foo
 * - `000100` -> __4__: #foo precedes #bar
 * - `001000` -> __8__: #bar contains #foo
 * - `010000` -> __16__: #foo contains #bar
 *
 * You can check for any of these conditions using a bitwise AND:
 *
 *     if( $('#foo').compare($('#bar')) & 2 ) {
 *       console.log("#bar precedes #foo")
 *     }
 *
 * @param {HTMLElement|jQuery} element an element or jQuery collection to compare against.
 * @return {Number} A number representing a bitmask deatiling how the elements are positioned from each other.
 */

// See http://ejohn.org/blog/comparing-document-position/
$.fn.compare = function(element){ //usually
	try{
		// Firefox 3 throws an error with XUL - we can't use compare then
		element = element.jquery ? element[0] : element;
	}catch(e){
		return null;
	}

	// make sure we aren't coming from XUL element
	if (window.HTMLElement) {
		var s = HTMLElement.prototype.toString.call(element)
		if (s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]' || s === '[object Window]') {
			return null;
		}
	}

	if(this[0].compareDocumentPosition){
		// For browsers that support it, use compareDocumentPosition
		// https://developer.mozilla.org/en/DOM/Node.compareDocumentPosition
		return this[0].compareDocumentPosition(element);
	}

	// this[0] contains element
	if(this[0] == document && element != document) return 8;

	var number =
			// this[0] contains element
			(this[0] !== element && this[0].contains(element) && 16) +
			// element contains this[0]
			(this[0] != element && element.contains(this[0]) && 8),
		docEl = document.documentElement;

	// Use the sourceIndex
	if(this[0].sourceIndex){
		// this[0] precedes element
		number += (this[0].sourceIndex < element.sourceIndex && 4)
		// element precedes foo[0]
		number += (this[0].sourceIndex > element.sourceIndex && 2)
		// The nodes are in different documents
		number += (this[0].ownerDocument !== element.ownerDocument ||
			(this[0] != docEl && this[0].sourceIndex <= 0 ) ||
			(element != docEl && element.sourceIndex <= 0 )) && 1
	}

	return number;
}

// ## jquery/dom/dimensions/dimensions.js


var
	//margin is inside border
	weird = /button|select/i,
	getBoxes = {},
    checks = {
        width: ["Left", "Right"],
        height: ['Top', 'Bottom'],
        oldOuterHeight: $.fn.outerHeight,
        oldOuterWidth: $.fn.outerWidth,
        oldInnerWidth: $.fn.innerWidth,
        oldInnerHeight: $.fn.innerHeight
    },
	supportsSetter = $.fn.jquery >= '1.8.0';

$.each({ 

/**
 * @function jQuery.fn.outerWidth
 * @parent jQuery.dimensions
 *
 * `jQuery.fn.outerWidth([value], [includeMargins])` lets you set
 * the outer width of an object where:
 *
 *      outerWidth = width + padding + border + (margin)
 *
 * And can be used like:
 *
 *      $("#foo").outerWidth(100); //sets outer width
 *      $("#foo").outerWidth(100, true); // uses margins
 *      $("#foo").outerWidth(); //returns outer width
 *      $("#foo").outerWidth(true); //returns outer width + margins
 *
 * When setting the outerWidth, it adjusts the width of the element.
 * If *includeMargin* is set to `true` margins will also be included.
 * It is also possible to animate the outer width:
 * 
 *      $('#foo').animate({ outerWidth: 200 });
 *
 * @param {Number} [width] The width to set
 * @param {Boolean} [includeMargin=false] Makes setting the outerWidth adjust
 * for margins.
 * @return {jQuery|Number} Returns the outer width or the jQuery wrapped elements
 * if you are setting the outer width.
 */
width: 
/**
 * @function jQuery.fn.innerWidth
 * @parent jQuery.dimensions
 *
 * `jQuery.fn.innerWidth([value])` lets you set the inner width of an element where
 * 
 *      innerWidth = width + padding
 *      
 * Use it like:
 *
 *      $("#foo").innerWidth(100); //sets inner width
 *      $("#foo").outerWidth(); // returns inner width
 *      
 * Or in an animation like:
 * 
 *      $('#foo').animate({ innerWidth : 200 });
 *
 * Setting inner width adjusts the width of the element.
 *
 * @param {Number} [width] The inner width to set
 * @return {jQuery|Number} Returns the inner width or the jQuery wrapped elements
 * if you are setting the inner width.
 */
"Width", 
/**
 * @function jQuery.fn.outerHeight
 * @parent jQuery.dimensions
 *
 * `jQuery.fn.outerHeight([value], [includeMargins])` lets
 * you set the outer height of an object where:
 *
 *      outerHeight = height + padding + border + (margin)
 *
 * And can be used like:
 *
 *      $("#foo").outerHeight(100); //sets outer height
 *      $("#foo").outerHeight(100, true); // uses margins
 *      $("#foo").outerHeight(); //returns outer height
 *      $("#foo").outerHeight(true); //returns outer height + margins
 *
 * When setting the outerHeight, it adjusts the height of the element.
 * If *includeMargin* is set to `true` margins will also be included.
 * It is also possible to animate the outer heihgt:
 *
 *      $('#foo').animate({ outerHeight : 200 });
 *
 * @param {Number} [height] The height to set
 * @param {Boolean} [includeMargin=false] Makes setting the outerHeight adjust
 * for margins.
 * @return {jQuery|Number} Returns the outer height or the jQuery wrapped elements
 * if you are setting the outer height.
 */
height: 
/**
 * @function jQuery.fn.innerHeight
 * @parent jQuery.dimensions
 *
 * `jQuery.fn.innerHeight([value])` lets you set the inner height of an element where
 *
 *      innerHeight = height + padding
 *
 * Use it like:
 *
 *      $("#foo").innerHeight(100); //sets inner height
 *      $("#foo").outerHeight(); // returns inner height
 *
 * Or in an animation like:
 *
 *      $('#foo').animate({ innerHeight : 200 });
 *
 * Setting inner height adjusts the height of the element.
 *
 * @param {Number} [height] The inner height to set
 * @return {jQuery|Number} Returns the inner height or the jQuery wrapped elements
 * if you are setting the inner height.
 */
// for each 'height' and 'width'
"Height" }, function(lower, Upper) {

    //used to get the padding and border for an element in a given direction
    getBoxes[lower] = function(el, boxes) {
        var val = 0;
        if (!weird.test(el.nodeName)) {
            //make what to check for ....
            var myChecks = [];
            $.each(checks[lower], function() {
                var direction = this;
                $.each(boxes, function(name, val) {
                    if (val)
                        myChecks.push(name + direction+ (name == 'border' ? "Width" : "") );
                })
            })
            $.each($.styles(el, myChecks), function(name, value) {
                val += (parseFloat(value) || 0);
            })
        }
        return val;
    }

    //getter / setter
	if(!supportsSetter) {
	    $.fn["outer" + Upper] = function(v, margin) {
	        var first = this[0];
			if (typeof v == 'number') {
				// Setting the value
	            first && this[lower](v - getBoxes[lower](first, {padding: true, border: true, margin: margin}))
	            return this;
	        } else {
				// Return the old value
	            return first ? checks["oldOuter" + Upper].apply(this, arguments) : null;
	        }
	    }
	    $.fn["inner" + Upper] = function(v) {
	        var first = this[0];
			if (typeof v == 'number') {
				// Setting the value
	            first&& this[lower](v - getBoxes[lower](first, { padding: true }))
	            return this;
	        } else {
				// Return the old value
	            return first ? checks["oldInner" + Upper].apply(this, arguments) : null;
	        }
	    }
	}

    //provides animations
	var animate = function(boxes){
		// Return the animation function
		return function(fx){
			if (fx[supportsSetter ? 'pos' : 'state'] == 0) {
	            fx.start = $(fx.elem)[lower]();
	            fx.end = fx.end - getBoxes[lower](fx.elem,boxes);
	        }
	        fx.elem.style[lower] = (fx.pos * (fx.end - fx.start) + fx.start) + "px"
		}
	}
    $.fx.step["outer" + Upper] = animate({padding: true, border: true})
	$.fx.step["outer" + Upper+"Margin"] =  animate({padding: true, border: true, margin: true})
	$.fx.step["inner" + Upper] = animate({padding: true})

})

// ## jquery/dom/within/within.js

	// Checks if x and y coordinates are within a box with left, top, width and height
   var withinBox = function(x, y, left, top, width, height ){
        return (y >= top &&
                y <  top + height &&
                x >= left &&
                x <  left + width);
    } 
/**
 * @function jQuery.fn.within
 * @parent jQuery.within
 * @plugin jquery/dom/within
 * 
 * Returns all elements matching the selector that touch a given point:
 * 
 *     // get all elements that touch 200x200.
 *     $('*').within(200, 200);
 * 
 * @param {Number} left the position from the left of the page 
 * @param {Number} top the position from the top of the page
 * @param {Boolean} [useOffsetCache=false] cache the dimensions and offset of the elements.
 * @return {jQuery} a jQuery collection of elements whos area
 * overlaps the element position.
 */
$.fn.within= function(left, top, useOffsetCache) {
    var ret = []
    this.each(function(){
        var q = jQuery(this);

        if (this == document.documentElement) {
			return ret.push(this);
		}

	    // uses either the cached offset or .offset()
        var offset = useOffsetCache ? 
						$.data(this,"offsetCache") || $.data(this,"offsetCache", q.offset()) :
						q.offset();

        // Check if the given coordinates are within the area of the current element
	    var res =  withinBox(left, top,  offset.left, offset.top,
                                    this.offsetWidth, this.offsetHeight );

        if (res) {
	        // Add it to the results
			ret.push(this);
		}
    });
    
    return this.pushStack( $.unique( ret ), "within", left+","+top );
}


/**
 * @function jQuery.fn.withinBox
 * @parent jQuery.within
 *
 * Returns all elements matching the selector that have a given area in common:
 *
 *      $('*').withinBox(200, 200, 100, 100)
 *
 * @param {Number} left the position from the left of the page
 * @param {Number} top the position from the top of the page
 * @param {Number} width the width of the area
 * @param {Number} height the height of the area
 * @param {Boolean} [useOffsetCache=false] cache the dimensions and offset of the elements.
 * @return {jQuery} a jQuery collection of elements whos area
 * overlaps the element position.
 */
$.fn.withinBox = function(left, top, width, height, useOffsetCache){
	var ret = []
    this.each(function(){
        var q = jQuery(this);

        if(this == document.documentElement) return  ret.push(this);

	    // use cached offset or .offset()
        var offset = useOffsetCache ? 
			$.data(this,"offset") ||
			$.data(this,"offset", q.offset()) :
			q.offset();


        var ew = q.width(), eh = q.height(),
	        // Checks if the element offset is within the given box
	        res =  !( (offset.top > top+height) || (offset.top +eh < top) || (offset.left > left+width ) || (offset.left+ew < left));

        if(res)
            ret.push(this);
    });
    return this.pushStack( $.unique( ret ), "withinBox", $.makeArray(arguments).join(",") );
}

// ## jquery/event/destroyed/destroyed.js

	/**
	 * @attribute destroyed
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/dom/destroyed/destroyed.js
	 * @test jquery/event/destroyed/qunit.html
	 */

	// Store the old jQuery.cleanData
	var oldClean = $.cleanData;

	// Overwrites cleanData which is called by jQuery on manipulation methods
	$.cleanData = function( elems ) {
		for ( var i = 0, elem;
		(elem = elems[i]) !== undefined; i++ ) {
			// Trigger the destroyed event
			$(elem).triggerHandler("destroyed");
		}
		// Call the old jQuery.cleanData
		oldClean(elems);
	};
// ## jquery/event/fastfix/fastfix.js

	// http://bitovi.com/blog/2012/04/faster-jquery-event-fix.html
	// https://gist.github.com/2377196

	// IE 8 has Object.defineProperty but it only defines DOM Nodes. According to
	// http://kangax.github.com/es5-compat-table/#define-property-ie-note
	// All browser that have Object.defineProperties also support Object.defineProperty properly
	if(Object.defineProperties) {
		var
			// Use defineProperty on an object to set the value and return it
			set = function (obj, prop, val) {
				if(val !== undefined) {
					Object.defineProperty(obj, prop, {
						value : val
					});
				}
				return val;
			},
			// special converters
			special = {
				pageX : function (original) {
					if(!original) {
						return;
					}

					var eventDoc = this.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					return original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				},
				pageY : function (original) {
					if(!original) {
						return;
					}

					var eventDoc = this.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					return original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
				},
				relatedTarget : function (original) {
					if(!original) {
						return;
					}

					return original.fromElement === this.target ? original.toElement : original.fromElement;
				},
				metaKey : function (originalEvent) {
					if(!originalEvent) {
						return;
					}
					return originalEvent.ctrlKey;
				},
				which : function (original) {
					if(!original) {
						return;
					}

					return original.charCode != null ? original.charCode : original.keyCode;
				}
			};

		// Get all properties that should be mapped
		$.each($.event.keyHooks.props.concat($.event.mouseHooks.props).concat($.event.props), function (i, prop) {
			if (prop !== "target") {
				(function () {
					Object.defineProperty($.Event.prototype, prop, {
						get : function () {
							// get the original value, undefined when there is no original event
							var originalValue = this.originalEvent && this.originalEvent[prop];
							// overwrite getter lookup
							return this['_' + prop] !== undefined ? this['_' + prop] : set(this, prop,
								// if we have a special function and no value
								special[prop] && originalValue === undefined ?
									// call the special function
									special[prop].call(this, this.originalEvent) :
									// use the original value
									originalValue)
						},
						set : function (newValue) {
							// Set the property with underscore prefix
							this['_' + prop] = newValue;
						}
					});
				})();
			}
		});

		$.event.fix = function (event) {
			if (event[ $.expando ]) {
				return event;
			}
			// Create a jQuery event with at minimum a target and type set
			var originalEvent = event,
				event = $.Event(originalEvent);
			event.target = originalEvent.target;
			// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
			if (!event.target) {
				event.target = originalEvent.srcElement || document;
			}

			// Target should not be a text node (#504, Safari)
			if (event.target.nodeType === 3) {
				event.target = event.target.parentNode;
			}

			return event;
		}
	}

	// ## jquery/event/livehack/livehack.js


	var event = $.event,

		//helper that finds handlers by type and calls back a function, this is basically handle
		// events - the events object
		// types - an array of event types to look for
		// callback(type, handlerFunc, selector) - a callback
		// selector - an optional selector to filter with, if there, matches by selector
		//     if null, matches anything, otherwise, matches with no selector
		findHelper = function( events, types, callback, selector ) {
			var t, type, typeHandlers, all, h, handle, 
				namespaces, namespace,
				match;
			for ( t = 0; t < types.length; t++ ) {
				type = types[t];
				all = type.indexOf(".") < 0;
				if (!all ) {
					namespaces = type.split(".");
					type = namespaces.shift();
					namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
				}
				typeHandlers = (events[type] || []).slice(0);

				for ( h = 0; h < typeHandlers.length; h++ ) {
					handle = typeHandlers[h];
					
					match = (all || namespace.test(handle.namespace));
					
					if(match){
						if(selector){
							if (handle.selector === selector  ) {
								callback(type, handle.origHandler || handle.handler);
							}
						} else if (selector === null){
							callback(type, handle.origHandler || handle.handler, handle.selector);
						}
						else if (!handle.selector ) {
							callback(type, handle.origHandler || handle.handler);
							
						} 
					}
					
					
				}
			}
		};

	/**
	 * Finds event handlers of a given type on an element.
	 * @param {HTMLElement} el
	 * @param {Array} types an array of event names
	 * @param {String} [selector] optional selector
	 * @return {Array} an array of event handlers
	 */
	event.find = function( el, types, selector ) {
		var events = ( $._data(el) || {} ).events,
			handlers = [],
			t, liver, live;

		if (!events ) {
			return handlers;
		}
		findHelper(events, types, function( type, handler ) {
			handlers.push(handler);
		}, selector);
		return handlers;
	};
	/**
	 * Finds all events.  Group by selector.
	 * @param {HTMLElement} el the element
	 * @param {Array} types event types
	 */
	event.findBySelector = function( el, types ) {
		var events = $._data(el).events,
			selectors = {},
			//adds a handler for a given selector and event
			add = function( selector, event, handler ) {
				var select = selectors[selector] || (selectors[selector] = {}),
					events = select[event] || (select[event] = []);
				events.push(handler);
			};

		if (!events ) {
			return selectors;
		}
		//first check live:
		/*$.each(events.live || [], function( i, live ) {
			if ( $.inArray(live.origType, types) !== -1 ) {
				add(live.selector, live.origType, live.origHandler || live.handler);
			}
		});*/
		//then check straight binds
		findHelper(events, types, function( type, handler, selector ) {
			add(selector || "", type, handler);
		}, null);

		return selectors;
	};
	event.supportTouch = "ontouchend" in document;
	
	$.fn.respondsTo = function( events ) {
		if (!this.length ) {
			return false;
		} else {
			//add default ?
			return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
		}
	};
	$.fn.triggerHandled = function( event, data ) {
		event = (typeof event == "string" ? $.Event(event) : event);
		this.trigger(event, data);
		return event.handled;
	};
	/**
	 * Only attaches one event handler for all types ...
	 * @param {Array} types llist of types that will delegate here
	 * @param {Object} startingEvent the first event to start listening to
	 * @param {Object} onFirst a function to call 
	 */
	event.setupHelper = function( types, startingEvent, onFirst ) {
		if (!onFirst ) {
			onFirst = startingEvent;
			startingEvent = null;
		}
		var add = function( handleObj ) {
			var bySelector, 
                            selector = handleObj.selector || "",
                            namespace  = handleObj.namespace ? '.'+handleObj.namespace : '';
                            
			if ( selector ) {
				bySelector = event.find(this, types, selector);
				if (!bySelector.length ) {
					$(this).delegate(selector, startingEvent + namespace, onFirst);
				}
			}
			else {
				//var bySelector = event.find(this, types, selector);
				if (!event.find(this, types, selector).length ) {
					event.add(this, startingEvent + namespace, onFirst, {
						selector: selector,
						delegate: this
					});
				}

			}

		},
			remove = function( handleObj ) {
				var bySelector, selector = handleObj.selector || "";
				if ( selector ) {
					bySelector = event.find(this, types, selector);
					if (!bySelector.length ) {
						$(this).undelegate(selector, startingEvent, onFirst);
					}
				}
				else {
					if (!event.find(this, types, selector).length ) {
						event.remove(this, startingEvent, onFirst, {
							selector: selector,
							delegate: this
						});
					}
				}
			};
		$.each(types, function() {
			event.special[this] = {
				add: add,
				remove: remove,
				setup: function() {},
				teardown: function() {}
			};
		});
	};

	// ## jquery/event/hover/hover.js

	/**
	 * @class jQuery.Hover
	 * @plugin jquery/event/hover
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/event/hover/hover.js
	 * @parent jQuery.event.hover
	 *
	 * Creates a new hover. The constructor should not be called directly.
	 *
	 * An instance of `$.Hover` is passed as the second argument to each
	 * [jQuery.event.hover] event handler:
	 *
	 *      $('#menu').on("hoverinit", function(ev, hover) {
	 *          // Set the hover distance to 20px
	 *          hover.distance(20);
	 *      });
	 */
	$.Hover = function () {
		this._delay = $.Hover.delay;
		this._distance = $.Hover.distance;
		this._leave = $.Hover.leave
	};
	/**
	 * @Static
	 */
	$.extend($.Hover, {
		/**
		 * @attribute delay
		 *
		 * `$.Hover.delay` is the delay (in milliseconds) after which the hover is
		 * activated by default.
		 *
		 * Set this value as a global default. The default is 100ms.
		 *
		 *      // Set the global hover delay to 1 second
		 *      $.Hover.delay = 1000;
		 */
		delay : 100,
		/**
		 * @attribute distance
		 *
		 * `$.Hover.distance` is the maximum distance (in pixels) that the mouse is allowed to
		 * travel within the time of [jQuery.Hover.delay] in order to activate a hover.
		 *
		 * Set this value as a global default. The default is 10px.
		 *
		 *      // Set the global hover distance to 1 pixel
		 *      $.Hover.distance = 1;
		 */
		distance : 10,
		leave : 0
	})

	/**
	 * @Prototype
	 */
	$.extend($.Hover.prototype, {
		/**
		 * `hover.delay(time)` sets the delay (in ms) for this hover.
		 * This method should only be used in [jQuery.event.hover.hoverinit hoverinit]:
		 *
		 *      $('.hoverable').on('hoverinit', function(ev, hover) {
		 *          // Set the delay to 500ms
		 *          hover.delay(500);
		 *      });
		 *
		 * @param {Number} delay the number of milliseconds used to determine a hover
		 * @return {$.Hover} The hover object
		 */
		delay : function (delay) {
			this._delay = delay;
			return this;
		},
		/**
		 * `hover.distance(px) sets the maximum distance (in pixels) the mouse is allowed to travel in order to activate
		 * the hover. This method should only be used in [jQuery.event.hover.hoverinit hoverinit]:
		 *
		 *      $('.hoverable').on('hoverinit', function(ev, hover) {
		 *          // Set the distance to 1px
		 *          hover.distance(1);
		 *      });
		 *
		 * @param {Number} distance the max distance in pixels a mouse can move to be considered a hover
		 * @return {$.Hover} The hover object
		 */
		distance : function (distance) {
			this._distance = distance;
			return this;
		},
		/**
		 * `hover.leave(delay)` sets a delay for how long the hover should stay active after the mouse left.
		 * This method should only be used in [jQuery.event.hover.hoverinit hoverinit]:
		 *
		 *      $('.hoverable').on('hoverinit', function(ev, hover) {
		 *          // Stay active for another second after the mouse left
		 *          hover.leave(1000);
		 *      });
		 *
		 * @param {Number} delay the number of milliseconds the hover should stay active after the mouse leaves
		 * @return {$.Hover} The hover object
		 */
		leave : function (leave) {
			this._leave = leave;
			return this;
		}
	})
	var event = $.event,
		handle = event.handle,
		onmouseenter = function (ev) {
			// now start checking mousemoves to update location
			var delegate = ev.delegateTarget || ev.currentTarget;
			var selector = ev.handleObj.selector;
			var pending = $.data(delegate,"_hover"+selector);
			// prevents another mouseenter until current has run its course
			if(pending) {
				// Under some  circumstances, mouseleave may never fire
				// (e.g., the element is removed while hovered)
				// so if we've entered another element, wait the leave time,
				// then force it to release.
				if(!pending.forcing) {
					pending.forcing = true;
					clearTimeout(pending.leaveTimer);
					var leaveTime = pending.leaving ?
						Math.max(0,pending.hover.leave - (new Date() - pending.leaving)) :
						pending.hover.leave;
					var self = this;

					setTimeout(function() {
						pending.callHoverLeave();
						onmouseenter.call(self,ev);
					},leaveTime);
				}
				return;
			}
			var loc = {
					pageX : ev.pageX,
					pageY : ev.pageY
				},
			// The current distance
			dist = 0,
			// Timer that checks for the distance travelled
			timer,
			enteredEl = this,
			// If we are hovered
			hovered = false,
			// The previous event
			lastEv = ev,
			// The $.Hover instance passed to events
			hover = new $.Hover(),
			// timer if hover.leave has been called
			leaveTimer,
			// Callback for triggering hoverleave
			callHoverLeave = function () {
				$.each(event.find(delegate, ["hoverleave"], selector), function () {
					this.call(enteredEl, ev, hover)
				})
				cleanUp();
			},
			mousemove = function (ev) {
				clearTimeout(leaveTimer);
				// Update the distance and location
				dist += Math.pow(ev.pageX - loc.pageX, 2) + Math.pow(ev.pageY - loc.pageY, 2);
				loc = {
					pageX : ev.pageX,
					pageY : ev.pageY
				}
				lastEv = ev
			},
			mouseleave = function (ev) {
				clearTimeout(timer);
				if (hovered) {
					// go right away
					if (hover._leave === 0) {
						callHoverLeave();
					} else {
						clearTimeout(leaveTimer);
						// leave the hover after the time set in hover.leave(time)
						pending.leaving = new Date();
						leaveTimer = pending.leaveTimer = setTimeout(function(){
							callHoverLeave();
						}, hover._leave)
					}
				} else {
					cleanUp();
				}
			},
			cleanUp = function () {
				// Unbind all events and data
				$(enteredEl).unbind("mouseleave", mouseleave)
				$(enteredEl).unbind("mousemove", mousemove);
				$.removeData(delegate, "_hover" + selector)
			},
			hoverenter = function() {
				$.each(event.find(delegate, ["hoverenter"], selector), function () {
					this.call(enteredEl, lastEv, hover)
				})
				hovered = true;
			};
			pending = {
				callHoverLeave: callHoverLeave,
				hover: hover
			};
			$.data(delegate,"_hover"+selector, pending);

			// Bind the mousemove event
			$(enteredEl).bind("mousemove", mousemove).bind("mouseleave", mouseleave);
			// call hoverinit for each element with the hover instance
			$.each(event.find(delegate, ["hoverinit"], selector), function () {
				this.call(enteredEl, ev, hover)
			})

			if (hover._delay === 0) {
				hoverenter();
			} else {
				timer = setTimeout(function () {
					// check that we aren't moving around
					if (dist < hover._distance && $(enteredEl).queue().length == 0) {
						hoverenter();
						return;
					} else {
						// Reset distance and timer
						dist = 0;
						timer = setTimeout(arguments.callee, hover._delay)
					}
				}, hover._delay);
			}
		};

	/**
	 * @add jQuery.event.special
	 */
// Attach events
	event.setupHelper([
	/**
	 * @attribute hoverinit
	 * @parent jQuery.event.hover
	 *
	 * `hoverinit` is called when a hover is about to start (on `mouseenter`). Listen for `hoverinit` events to configure
	 * [jQuery.Hover::delay delay] and [jQuery.Hover::distance distance]
	 * for this specific event:
	 *
	 *      $(".option").on("hoverinit", function(ev, hover){
	 *          //set the distance to 10px
	 *          hover.distance(10);
	 *          //set the delay to 200ms
	 *          hover.delay(10);
	 *          // End the hover one second after the mouse leaves
	 *          hover.leave(1000);
	 *      })
	 */
		"hoverinit",
	/**
	 * @attribute hoverenter
	 * @parent jQuery.event.hover
	 *
	 * `hoverenter` events are called when the mouses less than [jQuery.Hover.prototype.distance] pixels in
	 * [jQuery.Hover.prototype.delay delay] milliseconds.
	 *
	 *      $(".option").on("hoverenter", function(ev, hover){
	 *          $(this).addClass("hovering");
	 *      })
	 */
		"hoverenter",
	/**
	 * @attribute hoverleave
	 * @parent jQuery.event.hover
	 *
	 * `hoverleave` is called when the mouse leaves an element that has been hovered.
	 *
	 *      $(".option").on("hoverleave", function(ev, hover){
	 *          $(this).removeClass("hovering");
	 *      })
	 */
		"hoverleave",
	/**
	 * @attribute hovermove
	 * @parent jQuery.event.hover
	 *
	 * `hovermove` is called when a `mousemove` occurs on an element that has been hovered.
	 *
	 *      $(".option").on("hovermove", function(ev, hover){
	 *          // not sure why you would want to listen for this
	 *          // but we provide it just in case
	 *      })
	 */
		"hovermove"], "mouseenter", onmouseenter)


	// ## jquery/event/swipe/swipe.js

var isPhantom = /Phantom/.test(navigator.userAgent),
	supportTouch = !isPhantom && "ontouchend" in document,
	scrollEvent = "touchmove scroll",
	// Use touch events or map it to mouse events
	touchStartEvent = supportTouch ? "touchstart" : "mousedown",
	touchStopEvent = supportTouch ? "touchend" : "mouseup",
	touchMoveEvent = supportTouch ? "touchmove" : "mousemove",
	data = function(event){
		var d = event.originalEvent.touches ?
			event.originalEvent.touches[ 0 ] :
			event;
		return {
			time: (new Date).getTime(),
			coords: [ d.pageX, d.pageY ],
			origin: $( event.target )
		};
	};

/**
 * @add jQuery.event.swipe
 */
var swipe = $.event.swipe = {
	/**
	 * @attribute delay
	 * Delay is the upper limit of time the swipe motion can take in milliseconds.  This defaults to 500.
	 * 
	 * A user must perform the swipe motion in this much time.
	 */
	delay : 500,
	/**
	 * @attribute max
	 * The maximum distance the pointer must travel in pixels.  The default is 75 pixels.
	 */
	max : 320,
	/**
	 * @attribute min
	 * The minimum distance the pointer must travel in pixels.  The default is 30 pixels.
	 */
	min : 30
};

$.event.setupHelper( [

/**
 * @hide
 * @attribute swipe
 */
"swipe",
/**
 * @hide
 * @attribute swipeleft
 */
'swipeleft',
/**
 * @hide
 * @attribute swiperight
 */
'swiperight',
/**
 * @hide
 * @attribute swipeup
 */
'swipeup',
/**
 * @hide
 * @attribute swipedown
 */
'swipedown'], touchStartEvent, function(ev){
	var
		// update with data when the event was started
		start = data(ev),
		stop,
		delegate = ev.delegateTarget || ev.currentTarget,
		selector = ev.handleObj.selector,
		entered = this;
	
	function moveHandler(event){
		if ( !start ) {
			return;
		}
		// update stop with the data from the current event
		stop = data(event);

		// prevent scrolling
		if ( Math.abs( start.coords[0] - stop.coords[0] ) > 10 ) {
			event.preventDefault();
		}
	};

	// Attach to the touch move events
	$(document.documentElement).bind(touchMoveEvent, moveHandler)
		.one(touchStopEvent, function(event){
			$(this).unbind( touchMoveEvent, moveHandler);
			// if start and stop contain data figure out if we have a swipe event
			if ( start && stop ) {
				// calculate the distance between start and stop data
				var deltaX = Math.abs(start.coords[0] - stop.coords[0]),
					deltaY = Math.abs(start.coords[1] - stop.coords[1]),
					distance = Math.sqrt(deltaX*deltaX+deltaY*deltaY);

				// check if the delay and distance are matched
				if ( stop.time - start.time < swipe.delay && distance >= swipe.min && distance <= swipe.max ) {
					var events = ['swipe'];
					// check if we moved horizontally
					if( deltaX >= swipe.min && deltaY < swipe.min) {
						// based on the x coordinate check if we moved left or right
						events.push( start.coords[0] > stop.coords[0] ? "swipeleft" : "swiperight" );
					} else
					// check if we moved vertically
					if(deltaY >= swipe.min && deltaX < swipe.min){
						// based on the y coordinate check if we moved up or down
						events.push( start.coords[1] < stop.coords[1] ? "swipedown" : "swipeup" );
					}

					// trigger swipe events on this guy
					$.each($.event.find(delegate, events, selector), function(){
						this.call(entered, ev, {start : start, end: stop})
					})
				
				}
			}
			// reset start and stop
			start = stop = undefined;
		})
});


})(this, jQuery);