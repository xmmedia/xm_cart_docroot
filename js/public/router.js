cart_public_app.router = new (Backbone.Router.extend({
	el : $('.js_cart'),
	routes: {
		'checkout' : 'checkout',
		'product_list' : 'product_list'
	},

	start : function() {
		Backbone.history.start({
			pushState : true,
			root : '/' + cart_config.route_prefix + '/'
		});
	},

	checkout : function() {
		cart_public_app.checkout = new cart_public_app.views.checkout({
			el : $('.js_cart_checkout')
		});
	},

	product_list : function() {
		// this.load_cart();
		this.load_summary();

		_.each($('.js_cart_add_product'), function(el) {
			new cart_public_app.views.add_product({ el : el });
		});
	},

	load_summary : function() {
		if ( ! cart_public_app.summary) {
			cart_public_app.summary = new cart_public_app.views.summary({
				el : $('.js_cart_summary')
			});
		}

		cart_public_app.summary.retrieve();
	},

	load_cart : function() {
		cart_public_app.order_products = new cart_public_app.collections.order_products().retrieve();
	}
}))();