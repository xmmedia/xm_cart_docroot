cart_public_app.views.add_product = Backbone.View.extend({
	events : {
		'submit' : 'add_product'
	},

	add_product : function(e) {
		e.preventDefault();

		var cart_product_id = parseInt(this.$el.find('.js_cart_product_id').val(), 0),
			quantity = parseInt(this.$el.find('.js_cart_order_product_quantity').val(), 0);

		cart_public_app.router.cart.loading();
		this.$('input[type="submit"]').prop('disabled', true);

		$.ajax({
			url : '/' + cart_config.prefix + '/add_product',
			data : {
				cart_product_id : cart_product_id,
				quantity : quantity
			},
			method : 'POST',
			dataType : 'JSON',
			context : this,
			success : function() {
				cart_public_app.router.order_products.retrieve();
				this.$('input[type="submit"]').prop('disabled', false);
			},
			error : function() {
				cart_public_app.router.order_products.retrieve();
				this.$('input[type="submit"]').prop('disabled', false);
			}
		});
	}
});