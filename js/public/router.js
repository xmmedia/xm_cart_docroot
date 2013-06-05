cart_public_app.router = new (Backbone.Router.extend({
	el : $('.js_cart'),
	routes: {
		'' : 'index',
		'product_list' : 'product_list'
	},

	initialize : function() {
		this.order_products = new cart_public_app.collections.order_products().retrieve();
	},

	start : function() {
		Backbone.history.start({ pushState : true, root : '/' + cart_config.prefix + '/' });
	},

	index : function() {
	},

	product_list : function() {
		_.each($('.js_cart_add_product'), function(el) {
			new cart_public_app.views.add_product({ el : el });
		});
	}

	/*close_index : function() {
		if (this.month_choose) {
			this.month_choose.undelegateEvents();
		}
	}*/
}))();