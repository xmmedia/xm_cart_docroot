cart_public_app.views.cart = Backbone.View.extend({
	el : $('.js_cart'),

	loading_template : Handlebars.compile('<img src="/images/loading.gif">'),
	cart_template : Handlebars.compile('<div class="cart"><ul class="js_cart_product_list"></ul><p><a href="/{{cart_prefix}}/cart_empty" class="js_cart_empty">Empty Cart</a></p></div>'),

	events : {
		'click .js_cart_empty' : 'cart_empty'
	},

	initialize : function() {
		this.collection.on('fetch', this.loading, this);
		this.collection.on('destroy', this.render, this);
		this.collection.on('reset', this.cart_reset, this);
	},

	loading : function() {
		this.$el.html(this.loading_template());
	},

	render : function() {
		if (this.collection.size() > 0) {
			this.$el.html(this.cart_template({
				cart_prefix : cart_config.prefix
			}));

			var ul = this.$('.js_cart_product_list');

			this.collection.forEach(function(order_product) {
				ul.append((new cart_public_app.views.cart_product({ model : order_product })).render().el);
			});
		} else {
			this.$el.html('<p><em>Your cart is currently empty.</em></p>');
		}

		return this;
	},

	cart_empty : function(e) {
		e.preventDefault();

		this.collection.reset();
	},

	cart_reset : function(collection) {
		if (collection.size() === 0) {
			this.loading();

			$.ajax({
				url : '/' + cart_config.prefix + '/cart_empty',
				dataType : 'JSON',
				context : this
			}).done(function() {
				this.render();
			}).fail(function() {
				this.$el.html('<p><em>There was a problem emptying your cart. Please try again later.</em></p>');

				var view = this;
				setTimeout(function() {
					view.render();
				}, 2000);
			});
		} else {
			this.render();
		}
	}
});