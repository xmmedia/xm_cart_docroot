var cart_public_app = {
	models : {},
	views : {},
	collections : {},

	// set to true in start() if the summary HTML element exists
	// and therefore we'll update it
	has_summary : false,
	// set to true in start() if the cart HTML element exists
	// and therefore we'll update it
	has_cart : false,

	ajax_action : function(action, data, options) {
		options = options ? _.clone(options) : {};
		data = data ? _.clone(data) : {};

		var ajax_options = _.defaults(options, {
			url : '/' + cart_config.route_prefix + '/' + action,
			data : data,
			method : 'POST',
			dataType : 'JSON'
		});

		var xhr = $.ajax(ajax_options);

		if (options.done) {
			xhr.done(options.done);
		} else {
			xhr.done(this.ajax_promise);
		}
		if (options.fail) {
			xhr.fail(options.fail);
		} else {
			xhr.fail(this.ajax_promise);
		}

		return xhr;
	},

	ajax_promise : function(return_data) {
		xm.process_ajax(return_data);
		cart_public_app.update_cart();
	},

	update_cart : function() {
		if (cart_public_app.has_summary) {
			cart_public_app.summary.retrieve();
		}
		if (cart_public_app.order_products_summary) {
			cart_public_app.order_products_summary.retrieve();
		}
		if (cart_public_app.has_cart) {
			cart_public_app.order_products.retrieve();
		}
	},

	start_checkout : function() {
		window.location.href = '/' + cart_config.route_prefix + '/checkout';
	},

	loading_template : Handlebars.compile('<img src="/images/loading.gif" class="js_loading">'),
	empty_cart_template : Handlebars.compile('<div class="cart_empty_msg">Your cart is currently empty.</div>'),
	error_template : Handlebars.compile('<div class="cart_error_msg">{{error}}</div>'),

	cart_product_list_template : '<table class="cart_product_list cart_product_list_editable js_cart_product_list">' +
			'<thead><tr>' +
				'<th class="col_name">Item</th>' +
				'<th class="col_quantity">Quantity</th>' +
				'<th class="col_unit_price">Unit Price</th>' +
				'<th class="col_amount">Amount</th>' +
				'<th class="col_remove"></th>' +
			'</tr></thead>' +
			'<tbody></tbody>' +
		'</table>',
	cart_donation_list_template : '<table class="cart_product_list cart_product_list_editable js_cart_product_list">' +
			'<thead><tr>' +
				'<th class="col_name"></th>' +
				'<th class="col_amount">Amount</th>' +
			'</tr></thead>' +
			'<tbody></tbody>' +
		'</table>'
};

Stripe.setPublishableKey(cart_config.stripe_publishable_key);