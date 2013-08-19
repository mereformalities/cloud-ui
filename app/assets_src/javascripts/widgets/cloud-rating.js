/* ============================================================
 * cloud-rating.js v1.0.0
 * http://pictropolis.github.com/cloud-ui/javascript.html#ratings
 * ============================================================
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* RATING PUBLIC CLASS DEFINITION
  * ============================== */

  var Rating = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.rating.defaults, options)
  }

  Rating.prototype.setRating = function (number) {
	var $el = this.$element
	  , $stars = $el.children()
	
	if (number < 0) number = 0
	if (number > 5) number = 5
	$stars.removeClass('on')

	if (number > 0)
		$($stars.get(number - 1))
		  .addClass('on')
		  .prevAll().addClass('on')
		
	$el.data('current-rating', number)
  }


 /* RATING PLUGIN DEFINITION
  * ======================== */

  $.fn.rating = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('rating')
        , options = typeof option == 'object' && option
      if (!data) $this.data('rating', (data = new Rating(this, options)))
	  if (option) data.setRating(option)
    })
  }

  $.fn.rating.Constructor = Rating


 /* RATING DATA-API
  * =============== */

  $(function () {
	var query = '[data-toggle=rating].editable i'
    $('body').on('click.rating.data-api', query, function (e) {
      var $star = $(e.target)
        , $el = $star.closest('.star-rating')
      $el.rating($star.index() + 1)
    }).on('mouseenter', query, function (e) {
		$(e.target).prevAll().addClass('trail')
		     .end().nextAll().addClass('open')
	}).on('mouseleave', query, function (e) {
		$(e.target).siblings()
            .removeClass('trail')
            .removeClass('open');	
	});
  })

}(window.jQuery || window.Zepto);