cart_public_app.router = new (Backbone.Router.extend({
	el : $('.js_cart'),
	routes: {
		'checkout' : 'checkout',
		'product_list' : 'product_list'
	},

	// set to true in start() if the summary HTML element exists
	// and therefore we'll update it
	has_summary : false,
	// set to true in start() if the cart HTML element exists
	// and therefore we'll update it
	has_cart : false,

	start : function() {
		if ($('.js_cart_summary').length > 0) {
			this.has_summary = true;
		}
		if ($('.js_cart').length > 0) {
			this.has_cart = true;
		}

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
		if (this.has_summary) {
			this.load_summary();
		}
		if (this.has_cart) {
			this.load_cart();
		}

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