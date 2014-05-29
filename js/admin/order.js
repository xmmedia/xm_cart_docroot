$(function() {
	// changing the order filter will submit the form
	$('.js_cart_order_filter_form').on('change', function() {
		this.submit();
	});

	// clicking any row in the order list goes to the order view
	$('.js_list').on('click', 'li:not(.js_headers)', function(e) {
		if ( ! $(e.target).is('a')) {
			window.location = $(this).find('.js_link').attr('href');
		}
	});
});