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
				'<div class="location_select">' +
					'{{#if show_change_shipping_location}}Current Shipping Location: <span class="js_cart_shipping_location js_location_select">{{#if shipping_state}}{{shipping_state}}, {{/if}}{{shipping_country}} <a href="" class="js_cart_shipping_location_change">Change</a></span>' +
					'{{else}}{{location_select_msg}}<br><span class="js_location_select">{{{country_select}}}</span>{{/if}}' +
				'</div>' +
				'<a href="/{{cart_route_prefix}}/cart_empty" class="js_cart_empty">Empty Cart</a>' +
			'</div>' +
			'<div class="cart_actions_right"><input type="button" value="Checkout" class="js_cart_checkout"></div>' +
		'</div>' +
		'</div>'),

	shipping_country_select_template : Handlebars.compile('<select name="" class="cart_location_country_id js_cart_location_country_id"><option value="">-- Select Your Shipping Country --</option>{{#each countries}}<option value="{{id}}">{{name}}</option>{{/each}}</select>'),
	shipping_state_select_template : Handlebars.compile('<select name="" class="cart_location_state_id js_cart_location_state_id"><option value="">-- Select Your Shipping Province/State --</option>{{#each states}}<option value="{{id}}">{{name}}</option>{{/each}}</select>'),
	// messages that appear beside the location select depending on if the shipping & tax functionality is enabled
	location_select_msgs : {
		both : 'To calculate the taxes and shipping, select your shipping location:',
		only_shipping : 'To calculate the shipping, select your shipping location:',
		only_tax : 'To calculate the taxes, select your shipping location:'
	},

	events : {
		'click .js_cart_empty' : 'cart_empty',
		'click .js_cart_checkout' : 'start_checkout',
		'change .js_cart_location_country_id' : 'change_country', // in the totals view
		'change .js_cart_location_state_id' : 'change_state', // in the totals view
		'click .js_cart_shipping_location_change' : 'change_shipping_location'
	},

	initialize : function (options) {
		this.options = options || {};
	},

	loading : function() {
		this.$el.html(cart_public_app.loading_template());
	},

	render : function() {
		if (this.collection.size() > 0) {
			var show_change_shipping_location = (cart_config.enable_shipping && ! this.options.order.get('show_location_select')),
				location_select_msg,
				country_select;
			if ( ! show_change_shipping_location) {
				if (cart_config.enable_shipping && cart_config.enable_tax) {
					location_select_msg = this.location_select_msgs.both;
				} else if (cart_config.enable_shipping) {
					location_select_msg = this.location_select_msgs.only_shipping;
				} else if (cart_config.enable_tax) {
					location_select_msg = this.location_select_msgs.only_tax;
				}

				country_select = this.shipping_country_select_template({ countries : cart_config.countries });
			}

			this.$el.html(this.cart_template({
				cart_route_prefix : cart_config.route_prefix,
				show_change_shipping_location : show_change_shipping_location,
				location_select_msg : location_select_msg,
				country_select : country_select,
				shipping_country : this.options.order.get('shipping_country'),
				shipping_state : this.options.order.get('shipping_state')
			}));

			var table = this.$('.js_cart_product_list tbody');

			this.collection.forEach(function(order_product) {
				table.append((new cart_public_app.views.cart_product({ model : order_product })).render().el);
			});

			// append the total rows
			// we want the innerHTML because it's going to be inside a <div>
			table.append(this.options.view_totals.render().el.innerHTML);
		} else {
			this.$el.html(cart_public_app.empty_cart_template());
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
				xm.process_ajax(return_data);

				this.failed();

				setTimeout(function() {
					cart_public_app.update_cart();
				}, 2000);
			}
		});
	},

	start_checkout : function() {
		cart_public_app.start_checkout();
	},

	failed : function() {
		this.$el.html(cart_public_app.error_template({ error : 'There was a problem loading your cart. Please try again later.' }));
	},

	change_country : function() {
		if ( ! cart_config.enable_shipping) {
			return;
		}

		var country_id = this.$('.js_cart_location_country_id').val();
		if (country_id) {
			this.add_location_loading();

			cart_public_app.ajax_action('set_shipping_country', {
				country_id : country_id
			}, {
				context : this,
				done : function(return_data) {
					if (xm.process_ajax(return_data) && return_data.show_state_select) {
						this.$('.js_location_select').append(this.shipping_state_select_template({ states : return_data.states }));
						this.$('.js_loading').remove();
					} else {
						cart_public_app.update_cart();
					}

				}
			});
		}
	},

	change_state : function() {
		if ( ! cart_config.enable_shipping) {
			return;
		}

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

		if ( ! cart_config.enable_shipping) {
			return;
		}

		// the events that take place when the "normal" shipping location is changed, will also happen on this
		this.$('.js_cart_shipping_location').html('<br>' + this.shipping_country_select_template({ countries : cart_config.countries }));
	}
});