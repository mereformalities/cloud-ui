/*
 * Cloud UI
 * Form helpers
 */
$(document).ready(function () {

	// TODO Set width to longest value
	// TODO Default to select prompt

	// Initialize select value labels
	$('.btn-select select').each(function () {
		if ($(this).val())
			$(this).siblings('span').text($(this).val());
	});

	// Update select value labels
	$('.btn-select select').on('change', function () {
		$(this).siblings('span').text($(this).val());
	});

});