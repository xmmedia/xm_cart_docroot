cart_public_app.views.add_product = Backbone.View.extend({
	events : {
		'submit' : 'add_product'
	},

	add_product : function(e) {
		e.preventDefault();

		cart_public_app.summary.loading();
		this.$('input[type="submit"]').prop('disabled', true);

		cart_public_app.ajax_action('add_product', {
			cart_product_id : this.$el.find('.js_cart_product_id').val(),
			quantity : this.$el.find('.js_cart_order_product_quantity').val()
		}, {
			context : this,
			done : this.ajax_promise,
			fail : this.ajax_promise
		});
	},

	ajax_promise : function(return_data) {
		xm.process_ajax(return_data);
		cart_public_app.update_cart();
		cart_public_app.summary.open_summary_details();
		this.$('input[type="submit"]').prop('disabled', false);
	}
});