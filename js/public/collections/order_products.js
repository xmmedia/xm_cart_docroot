cart_public_app.collections.order_products = Backbone.Collection.extend({
	model : cart_public_app.models.order_product,

	retrieve : function() {
		// can't do anything if the cart element doesn't exist
		if ( ! cart_public_app.router.has_cart) {
			return this;
		}

		var collection = this;

		collection.reset();

		if (cart_public_app.router && cart_public_app.cart) {
			cart_public_app.cart.loading();
		}

		cart_public_app.ajax_action('load_cart', {}, {
			done : function(return_data) {
				if (xm.process_ajax(return_data)) {
					_.each(return_data.products, function(product) {
						collection.add(product, { parse : true });
					});

					cart_public_app.order = new cart_public_app.models.order(return_data.order);
					cart_public_app.totals = new cart_public_app.collections.totals(return_data.total_rows, { parse : true });
					cart_public_app.view_totals = new cart_public_app.views.totals({
						collection : cart_public_app.totals,
						order : cart_public_app.order
					});

					// if there's an existing cart, undelegate the events so that it doesn't stay in memory and still fire events
					if (cart_public_app.cart) {
						cart_public_app.cart.undelegateEvents();
					}
					cart_public_app.cart = (new cart_public_app.views.cart({
						collection : collection,
						order : cart_public_app.order,
						view_totals : cart_public_app.view_totals
					})).render();
				} else {
					if (cart_public_app.cart) {
						cart_public_app.cart.failed();
					} else {
						cart_public_app.order_products.failed();
					}
				}
			},
			fail : function(return_data) {
				xm.process_ajax(return_data);
				if (cart_public_app.cart) {
					cart_public_app.cart.failed();
				} else {
					cart_public_app.order_products.failed();
				}
			}
		});

		return this;
	},

	failed : function() {
		$('.js_cart').html(cart_public_app.error_template({ error : 'There was a problem loading your cart. Please try again later.' }));
	}
});