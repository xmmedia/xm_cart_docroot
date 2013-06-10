var cart_public_app = {
	models : {},
	views : {},
	collections : {},

	ajax_action : function(action, data, options) {
		options = options ? _.clone(options) : {};
		data = data ? _.clone(data) : {};

		var ajax_options = _.defaults(options, {
			url : '/' + cart_config.prefix + '/' + action,
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
		cl4.process_ajax(return_data);
		cart_public_app.order_products.retrieve();
	},

	loading_template : Handlebars.compile('<img src="/images/loading.gif" class="js_loading">')
};

Stripe.setPublishableKey(cart_config.stripe_publishable_key);