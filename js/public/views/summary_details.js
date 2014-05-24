cart_public_app.views.summary_details = Backbone.View.extend({
	className : 'cart_summary_details js_cart_summary_details',

	cart_template : Handlebars.compile('<div class="cart">' +
		'{{{product_table}}}' +
		'<div class="cart_actions">' +
			'<div class="cart_actions_left"><a href="" class="js_cart_summary_close">Close</a></div>' +
			'<div class="cart_actions_center"><a href="{{cart_view_url}}" class="js_close_summary_details">View Cart</a></div>' +
			'<div class="cart_actions_right"><input type="button" value="Checkout" class="js_cart_checkout"></div>' +
		'</div>' +
		'</div>'),

	events : {
		'click .js_cart_summary_close' : 'close_summary_details',
		'click .js_cart_checkout' : 'start_checkout'
	},

	summary_el : null,

	set_data : function(data) {
		this.options || (this.options = {});

		this.collection = data.collection;
		this.options.order = data.order;
		this.options.view_totals = data.view_totals;

		return this;
	},

	retrieve : function() {
		// render right away to people know something is happening
		this.render();

		return this;
	},

	loading : function() {
		this.position_el();
	},

	position_el : function() {
		if ( ! this.summary_el) {
			this.summary_el = cart_public_app.summary.$el;
		}

		this.$el.html(cart_public_app.loading_template());

		// attach the summary details element to the summary parent element (likely the header)
		this.summary_el.parent().append(this.$el);

		// try to position the details right below the summary element
		var summary_pos = this.summary_el.position();
		this.$el.css({
				left : this.calculate_el_left_position(summary_pos) + 'px',
				top : this.calculate_el_top_position(summary_pos) + 'px'
			});

		return this;
	},

	calculate_el_left_position : function(summary_pos) {
		return (summary_pos.left + parseInt(this.summary_el.width(), 10) - parseInt(this.$el.width(), 10) - 12);
	},

	calculate_el_top_position : function(summary_pos) {
		return (summary_pos.top + parseInt(this.summary_el.height(), 10) - 2);
	},

	render : function() {
		if (this.$el.is(':visible')) {
			this.position_el();
		}

		if (this.collection.size() > 0) {
			this.$el.html(this.cart_template({
				cart_route_prefix : cart_config.route_prefix,
				cart_view_url : cart_config.cart_view_url,
				product_table : (this.options.order.get('donation_cart') ? cart_public_app.cart_donation_list_template : cart_public_app.cart_product_list_template)
			}));

			var table = this.$('.js_cart_product_list tbody');

			this.collection.forEach(function(order_product) {
				table.append((new cart_public_app.views.cart_product({
					model : order_product,
					donation_cart : this.options.order.get('donation_cart')
				})).render().el);
			}, this);

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

	close_summary_details : function(e) {
		e.preventDefault();
		cart_public_app.summary.close_summary_details();
	}
});