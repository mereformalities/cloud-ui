/* ===========================================================
 * cloud-inactivity
 * http://pictropolis.github.com/cloud-ui/javascript.html#inactivity
 * ===========================================================
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
 * ========================================================== */


!function ($) {

	'use strict'; // jshint ;_;

	var timeout = 7500,
		update, timer;

	update = function () {
		// Remove class
		$('body').removeClass('inactive');

		if (timer) {
			clearTimeout(timer);
			timer = 0;
		}
		timer = setTimeout(function () {
			// Append class
			$('body').addClass('inactive');
		}, timeout);
	};

	/* INACTIVITY DATA-API
	 * =============== */

	$(function () {
		// Set timer on mousemove
		$(document).mousemove(update); // throttle
		// Initialize
		update();
	});

}(window.jQuery || window.Zepto);
