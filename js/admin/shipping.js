$(function() {
	$('.js_delete_shipping').on('click', function(e) {
		if ( ! confirm('Are you sure you want to delete the shipping rate "' + $(this).data('name') + '"?' + "\n\n" + 'Note: Removing the shipping rate will not affect any orders that have already been completed.')) {
			e.preventDefault();
		}
	});
});