cart_public_app.views.cart = Backbone.View.extend({
	el : $('.js_cart'),

	loading_template : Handlebars.compile('<img src="/images/loading.gif">'),
	cart_template : Handlebars.compile('<div class="cart">' +
		'<table class="cart_product_list js_cart_product_list">' +
			'<thead><tr>' +
				'<th class="col_name">Item</th>' +
				'<th class="col_quantity">Quantity</th>' +
				'<th class="col_unit_price">Unit Price</th>' +
				'<th class="col_amount">Amount</th>' +
				'<th class="col_remove"></th>' +
			'</tr></thead>' +
			'<tbody></tbody>' +
		'</table>' +
		'<p><a href="/{{cart_prefix}}/cart_empty" class="js_cart_empty">Empty Cart</a></p></div>'),
	error_template : Handlebars.compile('<p><em>{{error}}</em></p>'),

	events : {
		'click .js_cart_empty' : 'cart_empty'
	},

	loading : function() {
		this.$el.html(this.loading_template());
	},

	render : function() {
		if (this.collection.size() > 0) {
			this.$el.html(this.cart_template({
				cart_prefix : cart_config.prefix
			}));

			var table = this.$('.js_cart_product_list tbody');

			this.collection.forEach(function(order_product) {
				table.append((new cart_public_app.views.cart_product({ model : order_product })).render().el);
			});
		} else {
			this.$el.html('<p><em>Your cart is currently empty.</em></p>');
		}

		return this;
	},

	cart_empty : function(e) {
		e.preventDefault();

		this.loading();

		cart_public_app.ajax_action('cart_empty', {}, {
			fail : function(return_data) {
				cl4.process_ajax(return_data);

				this.$el.html(this.error_template({ error : 'There was a problem emptying your cart. Please try again later.' }));

				setTimeout(function() {
					cart_public_app.order_products.retrieve();
				}, 2000);
			}
		});
	},

	failed : function() {
		this.$el.html(this.error_template({ error : 'There was a problem loading your cart. Please try again later.' }));
	}
});