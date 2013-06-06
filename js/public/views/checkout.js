cart_public_app.views.checkout = Backbone.View.extend({
	checkout_box_error_template : Handlebars.compile('<ul class="cl4_message"><li class="error">{{error}}</li></ul>'),

	events : {
		'click .js_cart_checkout_continue' : 'next_step'
	},

	initialize : function() {
		this.steps = this.$('.js_cart_checkout_step');

		_.each(this.steps, function(step) {
			$(step).data('cart_checkout_complete', 0);
		}, this);
	},

	next_step : function(e) {
		var step_container = $(e.target).closest('.js_cart_checkout_step'),
			allow_continue = this.validate_step(step_container);

		if (allow_continue) {
			this.goto_next_step(step_container);
		}
	},

	goto_next_step : function(step_container) {
		var checkout_view = this;

		step_container.find('.js_cart_checkout_box_open').hide()
			.promise().done(function() {
				step_container.find('.js_cart_checkout_box_closed').show()
					.promise().done(function() {
						step_container.data('cart_checkout_complete', 1);
						checkout_view.open_next_step(step_container);
					});
			});
	},

	open_next_step : function(current_step) {
		var next_step_num = parseInt($(current_step).data('cart_checkout_step'), 0) + 1;

		for (i = next_step_num - 1; i < this.steps.length; i ++) {
			var _step = $(this.steps[i]);
			if (_step.data('cart_checkout_complete') === 0) {
				this.open_step(_step);
				break;
			}
		}
	},

	open_step : function(step_container) {
		step_container.find('.js_cart_checkout_box_closed').hide()
			.promise().done(function() {
				step_container.find('.js_cart_checkout_box_open').show();
			});
	},

	validate_step : function(step_container) {
		switch (step_container.data('cart_checkout_step_type')) {
			case 'cart' :
				return this.validate_cart(step_container);

			case 'shipping' :
				return this.validate_shipping(step_container);

			case 'payment' :
				return this.validate_payment(step_container);

			case 'confirm' :
				return this.validate_confirm(step_container);

			default :
				return false;
		}
	},

	validate_cart : function(step_container) {
		return true;
	},

	validate_shipping : function(step_container) {
		step_container.find('.js_cart_checkout_continue').before('<img src="/images/loading.gif" class="js_loading">');

		var form = step_container.find('.js_cart_checkout_form_shipping');

		form.ajaxForm({
				dataType : 'JSON',
				context : this,
				success : function(return_data) {
					if (cl4.process_ajax(return_data)) {
						step_container.find('.js_cart_checkout_box_result').html(return_data.shipping_display);
						this.goto_next_step(step_container);
					} else {
						var messages;
						if (return_data.messages) {
							messages = return_data.messages;
						} else {
							messages = this.checkout_box_error_template({ error : 'There was a problem verifying your shipping information. Please try again later.' });
						}

						step_container.find('.js_cart_checkout_box_messages').html(messages);
						$('html, body').animate({
							scrollTop: step_container.offset().top
						}, 500);
					}
					step_container.find('.js_loading').remove();
				},
				error : function() {
					step_container.find('.js_cart_checkout_box_messages').html(this.checkout_box_error_template({ error : 'There was a problem verifying your shipping information. Please try again later.' }));
					step_container.find('.js_loading').remove();
				}
			})
			.submit();

		return false;
	},

	validate_payment : function(step_container) {
		return true;
	},

	validate_confirm : function(step_container) {
		return true;
	}
});