$(function() {
	$('.js_cart_order_filter_form').on('change', function() {
		this.submit();
	});

	$('.js_delete_tax').on('click', function(e) {
		if ( ! confirm('Are you sure you want to delete the tax "' + $(this).data('name') + '"?' + "\n\n" + 'Note: Removing the tax will not affect any orders that have already been completed.')) {
			e.preventDefault();
		}
	});

	$('.js_delete_shipping').on('click', function(e) {
		if ( ! confirm('Are you sure you want to delete the shipping rate "' + $(this).data('name') + '"?' + "\n\n" + 'Note: Removing the shipping rate will not affect any orders that have already been completed.')) {
			e.preventDefault();
		}
	});
});