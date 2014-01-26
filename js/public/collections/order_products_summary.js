cart_public_app.collections.order_products_summary = Backbone.Collection.extend({
	model : cart_public_app.models.order_product,

	retrieve : function() {
		// can't do anything if the cart element doesn't exist
		if ( ! cart_public_app.has_summary) {
			return this;
		}

		var collection = this;

		collection.reset();

		if (cart_public_app.router && cart_public_app.summary_details) {
			cart_public_app.summary_details.loading();
		}

		cart_public_app.ajax_action('load_cart', {}, {
			done : function(return_data) {
				if (xm.process_ajax(return_data)) {
					_.each(return_data.products, function(product) {
						collection.add(product, { parse : true });
					});

					cart_public_app.summary_order = new cart_public_app.models.order(return_data.order);
					cart_public_app.summary_totals = new cart_public_app.collections.totals(return_data.total_rows, { parse : true });
					cart_public_app.summary_view_totals = new cart_public_app.views.totals({
						collection : cart_public_app.summary_totals,
						order : cart_public_app.summary_order
					});

					cart_public_app.summary_details.set_data({
						collection : collection,
						order : cart_public_app.summary_order,
						view_totals : cart_public_app.summary_view_totals
					}).render();
				} else {
					if (cart_public_app.summary_details) {
						cart_public_app.summary_details.failed();
					} else {
						cart_public_app.order_products.failed();
					}
				}
			},
			fail : function(return_data) {
				xm.process_ajax(return_data);
				if (cart_public_app.summary_details) {
					cart_public_app.summary_details.failed();
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