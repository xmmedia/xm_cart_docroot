$(function() {
	$('.js_delete_tax').on('click', function(e) {
		if ( ! confirm('Are you sure you want to delete the tax "' + $(this).data('name') + '"?' + "\n\n" + 'Note: Removing the tax will not affect any orders that have already been completed.')) {
			e.preventDefault();
		}
	});
});