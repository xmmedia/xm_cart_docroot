$(function() {
	// changing the order filter will submit the form
	$('.js_cart_order_filter_form').on('change', function() {
		this.submit();
	});
});