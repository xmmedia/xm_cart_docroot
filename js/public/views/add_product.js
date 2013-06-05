cart_public_app.views.add_product = Backbone.View.extend({
	events : {
		'submit' : 'add_product'
	},

	add_product : function(e) {
		e.preventDefault();

		var cart_product_id = parseInt(this.$el.find('.js_cart_product_id').val(), 0),
			quantity = parseInt(this.$el.find('.js_cart_order_product_quantity').val(), 0),
			existing = cart_public_app.router.order_products.findWhere({ cart_product_id : cart_product_id });

		if (existing) {
			existing.set('quantity', existing.get('quantity') + quantity);
		} else {
			cart_public_app.router.order_products.add([{
				cart_product_id : cart_product_id,
				quantity : quantity
			}]);
		}

		cart_public_app.router.order_products.forEach(function(model) {
			model.save();
		});
	}
});