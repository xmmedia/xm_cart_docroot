cart_public_app.views.add_product = Backbone.View.extend({
	events : {
		'submit' : 'add_product'
	},

	add_product : function(e) {
		e.preventDefault();

		cart_public_app.router.cart.loading();
		this.$('input[type="submit"]').prop('disabled', true);

		$.ajax({
			url : '/' + cart_config.prefix + '/add_product',
			data : {
				cart_product_id : this.$el.find('.js_cart_product_id').val(),
				quantity : this.$el.find('.js_cart_order_product_quantity').val()
			},
			method : 'POST',
			dataType : 'JSON',
			context : this
		}).done(function() {
			cart_public_app.router.order_products.retrieve();
			this.$('input[type="submit"]').prop('disabled', false);
		}).fail(function() {
			cart_public_app.router.order_products.retrieve();
			this.$('input[type="submit"]').prop('disabled', false);
		});
	}
});