/*
 * Lazy Load - Zepto plugin for lazy loading images
 *
 * Copyright (c) 2007-2012 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://appelsiini.net/projects/lazyload
 *
 * Version:  1.7.2
 */
(function($, window) {

	var $window = $(window);

	$.fn.lazyload = function(options) {
		var elements = this;
		var settings = {
			threshold       : 0,
			failureLimit    : 0,
			event           : 'scroll',
			effect          : 'show',
			container       : window,
			dataAttribute   : 'original',
			skipInvisible   : true,
			appear          : null,
			load            : null
		};

		function update() {
			var counter = 0;

			elements.each(function () {
				if (settings.skipInvisible && !$(this).is(":visible")) {
					return;
				}
				if ($.aboveTheTop(this, settings) || $.leftOfEdge(this, settings)) {
					// Nothing
				}
				else if (!$.belowTheFold(this, settings) &&
						 !$.rightOfFold(this, settings)) {
					$(this).trigger('appear');
				}
				else if (++counter > settings.failureLimit) {
					return false;
				}
			});
		}

		if (options) {
			$.extend(settings, options);
		}
		
		// Named function to pass event handlers
		var updateHandler = function (event) {
			return update();
		}

		// Cache container as Zepto object
		var $scroller = (settings.container === undefined ||
						 settings.container === window) ? $window : $(settings.container);

		// Fire one update per scroll event (not one per image)
		if (0 === settings.event.indexOf('scroll')) {
			$scroller.on(settings.event, updateHandler);
			// Clean up event handler (using jquery++)
			$(this).on('destroyed', function () {
				$scroller.off(settings.event, updateHandler);
			});
		}

		elements.each(function () {
			var self = this,
				$self = $(this),
				elementsLeft;

			self.loaded = false;
			
			// Handle cached images ('load' is inconsistent)
			if (self.complete || self.readystate == 4) {
			      $self.trigger('load');
			}

			// When appear is triggered load original image
			$self.one('appear', function () {
				if (!this.loaded) {
					
					// console.log('appear called on '+ $self.data(settings.dataAttribute));

					// Run user-defined callback
					if (settings.appear) {
						elementsLeft = elements.length;
						settings.appear.call(self, elementsLeft, settings);
					}

					var loadHandler = function () {
						$self.hide()
							.attr('src', $self.data(settings.dataAttribute))
							[settings.effect](settings.effectSpeed);

						self.loaded = true;

						// Remove image from array so it is not looped next time
						var temp = $.grep(elements, function (element) {
							return !element.loaded;
						});
						elements = $(temp);

						// Run user-defined callback
						if (settings.load) {
							var elementsLeft = elements.length;
							settings.load.call(self, elementsLeft, settings);
						}
					}

					$('<img />') // Works better than $self but leaks memory...
					//$self
						.on('load', loadHandler)
						.attr('src', $self.data(settings.dataAttribute));
				}
			});

			// Load image if user-defined event is triggered
			if (0 !== settings.event.indexOf('scroll')) {
				$self.on(settings.event, function(event) {
					if (!self.loaded) {
						$self.trigger('appear');
					}
				});
			}
			
			// Additional event to fire an update manually
			$self.on('check', updateHandler);
		});

		// Check if something appears when window is resized
		$window.on('resize', updateHandler);
		
		// Clean up event handler (using jquery++)
		$(this).on('destroyed', function () {
			$window.off('resize', updateHandler);
		});

		// Force initial check if images should appear
		update();

		return this;
	};

})(window.jQuery || window.Zepto, window);
