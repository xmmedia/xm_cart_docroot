cart_public_app.views.checkout = Backbone.View.extend({
	checkout_box_error_template : Handlebars.compile('<ul class="cl4_message"><li class="error">{{error}}</li></ul>'),
	checkout_box_payment_error_template : Handlebars.compile('<ul class="cl4_message"><li class="error"><ul class="cl4_message_validation">{{#each msgs}}<li>{{this}}</li>{{/each}}</ul></li></ul>'),

	events : {
		'click .js_cart_checkout_continue' : 'next_step',
		'click .js_cart_checkout_box_edit' : 'edit_step',
		'click .js_cart_checkout_copy_shipping' : 'copy_shipping',
		'change .js_cart_checkout_form_billing' : 'billing_changed',
		'keyup .js_cart_checkout_credit_card_number' : 'display_card_type'
	},

	initialize : function() {
		this.steps = this.$('.js_cart_checkout_step');

		_.each(this.steps, function(step) {
			var _step = $(step);
			_step.data('cart_checkout_complete', 0);
			if (_step.data('cart_checkout_step_type') != 'cart') {
				_step.data('cart_checkout_step_is_open', 0);
			}
		}, this);

		this.current_step = this.$('.js_cart_checkout_step[data-cart_checkout_step_type="cart"]');
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

		step_container.find('.js_cart_checkout_box_open')
			.data('cart_checkout_step_is_open', 0)
			.hide().promise().done(function() {
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
		var view = this;
		this.current_step = step_container;
		step_container.find('.js_cart_checkout_box_closed')
			.data('cart_checkout_step_is_open', 1)
			.hide().promise().done(function() {
				step_container.find('.js_cart_checkout_box_open').show();
				view.clear_messages(step_container);
				view.scroll_to(step_container);
			});
	},

	close_step : function(step_container) {
		step_container.find('.js_cart_checkout_box_open')
			.data('cart_checkout_step_is_open', 0)
			.hide().promise().done(function() {
				step_container.find('.js_cart_checkout_box_closed').show();
			});
	},

	edit_step : function(e) {
		e.preventDefault();

		// var open_step = $('.js_cart_checkout_step[data-cart_checkout_step_is_open=1]');
		this.close_step(this.current_step);

		var step_container = $(e.target).closest('.js_cart_checkout_step');
		this.open_step(step_container);
	},

	copy_shipping : function(e) {
		e.preventDefault();

		_.each(this.$('.js_cart_checkout_form_shipping input, .js_cart_checkout_form_shipping select'), function(field) {
			var _field = $(field),
				field_name = _field.data('cart_shipping_field');

			if (field_name !== 'phone') {
				this.$('.js_cart_checkout_form_billing [data-cart_billing_field="' + field_name + '"]').val(_field.val());
			} else {
				var name_parts = _field.attr('name').split('['),
					phone_part = name_parts[(name_parts.length - 1)],
					phone_part_name = phone_part.substring(0, phone_part.length - 1);

				this.$('.js_cart_checkout_form_billing input[name*="' + phone_part_name + '"]').val(_field.val());
			}
		}, this);

		$('.js_cart_checkout_form_billing .js_cart_same_as_shipping_flag').val(1);
	},

	billing_changed : function() {
		$('.js_cart_checkout_form_billing .js_cart_same_as_shipping_flag').val(0);
	},

	display_card_type : function(e) {
		console.log(Stripe.card.cardType($(e.target).val()));
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
		this.add_loading(step_container);
		this.clear_messages(step_container);

		var verify_error = 'There was a problem verifying your shipping information. Please try again later.';

		step_container.find('.js_cart_checkout_form_shipping').ajaxForm({
			dataType : 'JSON',
			context : this,
			success : function(return_data) {
				if (cl4.process_ajax(return_data)) {
					step_container.find('.js_cart_checkout_box_result').html(return_data.shipping_display);
					this.goto_next_step(step_container);
				} else {
					var message_html;
					if (return_data.message_html) {
						message_html = return_data.message_html;
					} else {
						message_html = this.checkout_box_error_template({ error : verify_error });
					}

					this.add_messages(step_container, message_html);
				}
				this.remove_loading(step_container);
			},
			error : function() {
				step_container.find('.js_cart_checkout_box_messages').html(this.checkout_box_error_template({ error : verify_error }));
				this.remove_loading(step_container);
			}
		})
		.submit();

		return false;
	},

	validate_payment : function(step_container) {
		this.add_loading(step_container);
		this.clear_messages(step_container);

		var verify_error = 'There was a problem verifying your billing and payment information. Please try again later.';

		step_container.find('.js_cart_checkout_form_billing').ajaxForm({
			dataType : 'JSON',
			context : this,
			success : function(return_data) {
				if (cl4.process_ajax(return_data)) {
					// run a second request to valid the payment (credit card) information
					/*step_container.find('.js_cart_checkout_form_payment').ajaxForm({
						dataType : 'JSON',
						context : this,
						success : function(return_data) {
							if (cl4.process_ajax(return_data)) {
								step_container.find('.js_cart_checkout_box_result').html(return_data.billing_display);
								this.goto_next_step(step_container);
							} else {
								var message_html;
								if (return_data.message_html) {
									message_html = return_data.message_html;
								} else {
									message_html = this.checkout_box_error_template({ error : verify_error });
								}

								this.add_messages(step_container, message_html);
							}
							this.remove_loading(step_container);
						},
						error : function() {
							step_container.find('.js_cart_checkout_box_messages').html(this.checkout_box_error_template({ error : verify_error }));
							this.remove_loading(step_container);
						}
					})
					.submit();*/

					var payment_form = step_container.find('.js_cart_checkout_form_payment'),
						credit_card = {
							number : payment_form.find('.js_cart_checkout_credit_card_number').val(),
							security_code : payment_form.find('.js_cart_checkout_credit_card_security_code').val(),
							expiry_month : payment_form.find('.js_cart_checkout_credit_card_expiry_date_month').val(),
							expiry_year : payment_form.find('.js_cart_checkout_credit_card_expiry_date_year').val()
						},
						validation_msgs = [];

					if ( ! Stripe.card.validateCardNumber(credit_card.number)) {
						validation_msgs.push('Your Credit Card Number does not appear to be valid.');
					}
					if ( ! Stripe.card.validateCVC(credit_card.security_code)) {
						validation_msgs.push('The Security Code does not appear to be valid.');
					}
					if ( ! Stripe.card.validateExpiry(credit_card.expiry_month, credit_card.expiry_year)) {
						validation_msgs.push('The Expiry Date does not appear to be valid. Please confirm that the credit has not already expired.');
					}

					if (validation_msgs.length > 0) {
						this.add_messages(step_container, this.checkout_box_payment_error_template({ msgs : validation_msgs }));
					} else {
						Stripe.card.createToken({
							number: credit_card.number,
							cvc: credit_card.security_code,
							exp_month: credit_card.expiry_month,
							exp_year: credit_card.expiry_year,
							name : return_data.billing_address.first_name + ' ' + return_data.billing_address.last_name,
							address_line1 : return_data.billing_address.address_1,
							address_line2 : return_data.billing_address.address_2,
							address_city : return_data.billing_address.city,
							address_state : return_data.billing_address.state,
							address_zip : return_data.billing_address.postal_code,
							address_country : return_data.billing_address.country
						}, this.strip_response_handler);

						// .js_cart_checkout_payment_display
						step_container.find('.js_cart_checkout_box_result').html(return_data.billing_display);
						this.goto_next_step(step_container);
					}
				} else {
					var message_html;
					if (return_data.message_html) {
						message_html = return_data.message_html;
					} else {
						message_html = this.checkout_box_error_template({ error : verify_error });
					}

					this.add_messages(step_container, message_html);
				}
				this.remove_loading(step_container);
			},
			error : function() {
				step_container.find('.js_cart_checkout_box_messages').html(this.checkout_box_error_template({ error : verify_error }));
				this.remove_loading(step_container);
			}
		})
		.submit();

		return false;
	},

	strip_response_handler : function(status, response) {
console.log(status);
console.log(response);
	},

	validate_confirm : function(step_container) {
		return true;
	},

	add_loading : function(step_container) {
		step_container.find('.js_cart_checkout_continue').before('<img src="/images/loading.gif" class="js_loading">');
	},

	remove_loading : function(step_container) {
		step_container.find('.js_loading').remove();
	},

	add_messages : function(step_container, message_html) {
		step_container.find('.js_cart_checkout_box_messages').html(message_html);
		this.scroll_to(step_container);
	},

	clear_messages : function(step_container) {
		step_container.find('.js_cart_checkout_box_messages').empty();
	},

	scroll_to : function(element) {
		$('html, body').animate({
			scrollTop: element.offset().top
		}, 500);
	}
});