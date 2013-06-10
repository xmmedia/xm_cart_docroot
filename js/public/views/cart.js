cart_public_app.views.cart = Backbone.View.extend({
	el : $('.js_cart'),

	cart_template : Handlebars.compile('<div class="cart">' +
		'<table class="cart_product_list cart_product_list_editable js_cart_product_list">' +
			'<thead><tr>' +
				'<th class="col_name">Item</th>' +
				'<th class="col_quantity">Quantity</th>' +
				'<th class="col_unit_price">Unit Price</th>' +
				'<th class="col_amount">Amount</th>' +
				'<th class="col_remove"></th>' +
			'</tr></thead>' +
			'<tbody></tbody>' +
		'</table>' +
		'<div class="cart_actions">' +
			'<div class="cart_actions_left">' +
				'{{#if show_change_shipping_location}}Current Shipping Location: <span class="js_cart_shipping_location js_location_select">{{#if shipping_state}}{{shipping_state}}, {{/if}}{{shipping_country}} <a href="" class="js_cart_shipping_location_change">Change</a></span><br>{{/if}}' +
				'<a href="/{{cart_prefix}}/cart_empty" class="js_cart_empty">Empty Cart</a>' +
			'</div>' +
			'<div class="cart_actions_right"><input type="button" value="Checkout" class="js_cart_checkout"></div>' +
		'</div>' +
		'</div>'),
	error_template : Handlebars.compile('<p><em>{{error}}</em></p>'),

	events : {
		'click .js_cart_empty' : 'cart_empty',
		'click .js_cart_checkout' : 'start_checkout',
		'change .js_cart_location_country_id' : 'change_country', // in the totals view
		'change .js_cart_location_state_id' : 'change_state', // in the totals view
		'click .js_cart_shipping_location_change' : 'change_shipping_location'
	},

	loading : function() {
		this.$el.html(cart_public_app.loading_template());
	},

	render : function() {
		if (this.collection.size() > 0) {
			this.$el.html(this.cart_template({
				cart_prefix : cart_config.prefix,
				show_change_shipping_location : ( ! this.options.totals.model.get('show_location_select')),
				shipping_country : this.options.totals.model.get('shipping_country'),
				shipping_state : this.options.totals.model.get('shipping_state')
			}));

			var table = this.$('.js_cart_product_list tbody');

			this.collection.forEach(function(order_product) {
				table.append((new cart_public_app.views.cart_product({ model : order_product })).render().el);
			});

			// append the total rows
			// we want the innerHTML because it's going to be inside a <div>
			table.append(this.options.totals.render().el.innerHTML);
		} else {
			this.$el.html('<p><em>Your cart is currently empty.</em></p>');
		}

		return this;
	},

	cart_empty : function(e) {
		e.preventDefault();

		this.loading();
		this.undelegateEvents();

		cart_public_app.ajax_action('cart_empty', {}, {
			context : this,
			fail : function(return_data) {
				cl4.process_ajax(return_data);

				this.$el.html(this.error_template({ error : 'There was a problem emptying your cart. Please try again later.' }));

				setTimeout(function() {
					cart_public_app.order_products.retrieve();
				}, 2000);
			}
		});
	},

	start_checkout : function() {
		window.location.href = '/' + cart_config.prefix + '/checkout';
	},

	failed : function() {
		this.$el.html(this.error_template({ error : 'There was a problem loading your cart. Please try again later.' }));
	},

	change_country : function() {
		var country_id = this.$('.js_cart_location_country_id').val();
		if (country_id) {
			this.add_location_loading();

			cart_public_app.ajax_action('set_shipping_country', {
				country_id : country_id
			}, {
				context : this,
				done : function(return_data) {
					if (cl4.process_ajax(return_data) && return_data.show_state_select) {
						this.$('.js_location_select').append(this.options.totals.shipping_state_select_template({ states : return_data.states }));
						this.$('.js_loading').remove();
					} else {
						cart_public_app.order_products.retrieve();
					}

				}
			});
		}
	},

	change_state : function() {
		var state_id = this.$('.js_cart_location_state_id').val();
		if (state_id) {
			this.add_location_loading();

			cart_public_app.ajax_action('set_shipping_state', {
				state_id : state_id
			});
		}
	},

	add_location_loading : function() {
		this.$('.js_location_select').append(cart_public_app.loading_template());
	},

	change_shipping_location : function(e) {
		e.preventDefault();

		// the events that take place when the "normal" shipping location is changed, will also happen on this
		this.$('.js_cart_shipping_location').html('<br>' + this.options.totals.shipping_country_select_template({ countries : cart_config.countries }));
	}
});