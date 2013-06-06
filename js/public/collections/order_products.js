cart_public_app.collections.order_products = Backbone.Collection.extend({
	model : cart_public_app.models.order_product,

	retrieve : function() {
		var collection = this;

		collection.reset();

		if (cart_public_app.router && cart_public_app.cart) {
			cart_public_app.cart.loading();
		}

		cart_public_app.ajax_action('load_cart', {}, {
			done : function(return_data) {
				if (cl4.process_ajax(return_data)) {
					_.each(return_data.products, function(product) {
						collection.add(product, { parse : true });
					});

					cart_public_app.cart = (new cart_public_app.views.cart({ collection : collection })).render();
				} else {
					cart_public_app.cart.failed();
				}
			},
			fail : function(return_data) {
				cl4.process_ajax(return_data);
				cart_public_app.cart.failed();
			}
		});

		return this;
	}
});