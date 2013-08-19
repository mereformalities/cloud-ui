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

  	// TODO: Expand on hover
	// TODO: Collapse on timeout (re-check hover)
	// TODO: Expand on touch (mobile)


 /* EXPANDER PUBLIC CLASS DEFINITION
  * ============================== */

  var Expander = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.expander.defaults, options)
  }

  Expander.prototype.setState = function (state) {
    var d = 'disabled'
      , $el = this.$element
      , data = $el.data()
      , val = $el.is('input') ? 'val' : 'html'

    state = state + 'Text'
    data.resetText || $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d)
    }, 0)
  }

  Expander.prototype.toggle = function () {
    var $parent = this.$element.parent('[data-toggle="buttons-radio"]')

    $parent && $parent
      .find('.active')
      .removeClass('active')

    this.$element.toggleClass('active')
  }


 /* EXPANDER PLUGIN DEFINITION
  * ======================== */

  $.fn.expander = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('button')
        , options = typeof option == 'object' && option
      if (!data) $this.data('button', (data = new Expander(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.expander.defaults = {
    timeout: 300
  }

  $.fn.expander.Constructor = Expander


 /* EXPANDER DATA-API
  * =============== */

  $(function () {
    $('body').on('click.expander.data-api', '[data-toggle^=button]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('expander')) $btn = $btn.closest('.expander')
      $btn.expander('toggle')
    })
  })

}(window.jQuery || window.Zepto);