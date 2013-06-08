cart_public_app.views.checkout = Backbone.View.extend({
	error_template : Handlebars.compile('<ul class="cl4_message"><li class="error">{{error}}</li></ul>'),
	payment_error_template : Handlebars.compile('<ul class="cl4_message"><li class="error"><ul class="cl4_message_validation">{{#each msgs}}<li>{{this}}</li>{{/each}}</ul></li></ul>'),
	payment_display_template : Handlebars.compile('<p><strong>Payment Method</strong><br>{{card_type}} ...{{last_4}}</p>'),
	complete_loading_template : Handlebars.compile('<div class="js_loading"><img src="/images/loading.gif"></div>'),

	events : {
		'click .js_cart_checkout_continue' : 'next_step',
		'click .js_cart_checkout_box_edit' : 'edit_step',
		'click .js_cart_checkout_copy_shipping' : 'copy_shipping',
		'change .js_cart_checkout_form_billing' : 'billing_changed',
		'keyup .js_cart_checkout_credit_card_number' : 'display_card_type',
		'click .js_cart_checkout_complete_order_submit' : 'complete_order'
	},

	stripe_data : {},

	// if true, functionality should not happen
	// will be set to true when there is ajax going on, such as saving billing or completing the order
	processing : false,

	initialize : function() {
		this.steps = this.$('.js_cart_checkout_step');

		_.each(this.steps, function(step) {
			var _step = $(step);
			_step.data('cart_checkout_complete', 0);
		}, this);

		this.current_step = this.$('.js_cart_checkout_step[data-cart_checkout_step_type="cart"]');
	},

	next_step : function(e) {
		var step_container = $(e.target).closest('.js_cart_checkout_step'),
			allow_continue = this.validate_step(step_container);

		// if processing, don't process with any functionality
		if (this.processing) {
			return;
		}

		// only allow continue if the validate step returns true right away
		// in some cases, processing must be done first, so it will return false now
		// and then go to the next step later
		if (allow_continue) {
			this.goto_next_step(step_container);
		}
	},

	goto_next_step : function(step_container) {
		var checkout_view = this;

		step_container.find('.js_cart_checkout_box_open')
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
			.hide().promise().done(function() {
				step_container.find('.js_cart_checkout_box_open').show();
				view.clear_messages(step_container);
				view.scroll_to(step_container);
			});
	},

	close_step : function(step_container) {
		step_container.find('.js_cart_checkout_box_open')
			.hide().promise().done(function() {
				step_container.find('.js_cart_checkout_box_closed').show();
			});
	},

	edit_step : function(e) {
		e.preventDefault();

		// if processing, don't process with any functionality
		if (this.processing) {
			return;
		}

		this.close_step(this.current_step);

		var step_container = $(e.target).closest('.js_cart_checkout_step');
		this.open_step(step_container);
	},

	complete_order : function(e) {
		e.preventDefault();

		// if processing, don't process with any functionality
		if (this.processing) {
			return;
		}

		var button = $(e.target),
			step_container = button.closest('.js_cart_checkout_step'),
			verify_error = 'There was a problem processing your payment. Please contact us before trying again to prevent duplicate payments.';

		this.processing = true;
		this.clear_messages(step_container);
		button.after(this.complete_loading_template());

		// put the stripe data in a field so that it gets sent to the server
		this.$('.js_cart_checkout_stripe_token').val(this.stripe_data.id);

		this.$('.js_cart_checkout_form_complete_order').ajaxForm({
			dataType : 'JSON',
			context : this,
			success : function(return_data) {
				if (cl4.process_ajax(return_data) && return_data.payment_status == 'success') {
					window.location = '/' + cart_config.prefix + '/completed';
				} else {
					if (return_data.redirect) {
						window.location = return_data.redirect;
						return;
					}

					if (return_data.payment_status == 'fail') {
						window.location = '/' + cart_config.prefix + '/payment_failed';
					}

					var payment_step = this.$('.js_cart_checkout_step[data-cart_checkout_step_type="payment"]');

					this.close_step(step_container);

					payment_step.data('cart_checkout_complete', 0);
					this.open_step(payment_step);

					// payment_status: error or fail
					var message_html;
					if (return_data.message_html) {
						message_html = return_data.message_html;
					} else {
						message_html = this.error_template({ error : verify_error });
					}

					this.add_messages(payment_step, message_html);

					this.processing = false;
					this.remove_loading(step_container);
				}
			},
			error : function() {
				step_container.find('.js_cart_checkout_box_messages').html(this.error_template({ error : verify_error }));
				this.remove_loading(step_container);
			}
		})
		.submit();
	},

	copy_shipping : function(e) {
		e.preventDefault();

		// if processing, don't process with any functionality
		if (this.processing) {
			return;
		}

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

			case 'final' :
				return this.validate_final(step_container);

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

		this.processing = true;
		step_container.find('.js_cart_checkout_form_shipping').ajaxForm({
			dataType : 'JSON',
			context : this,
			success : function(return_data) {
				if (cl4.process_ajax(return_data)) {
					step_container.find('.js_cart_checkout_box_result').html(return_data.shipping_display);
					this.goto_next_step(step_container);
				} else {
					if (return_data.redirect) {
						window.location = return_data.redirect;
						return;
					}

					var message_html;
					if (return_data.message_html) {
						message_html = return_data.message_html;
					} else {
						message_html = this.error_template({ error : verify_error });
					}

					this.add_messages(step_container, message_html);
				}
				this.remove_loading(step_container);
				this.processing = false;
			},
			error : function() {
				step_container.find('.js_cart_checkout_box_messages').html(this.error_template({ error : verify_error }));
				this.processing = false;
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

		this.processing = true;
		step_container.find('.js_cart_checkout_form_billing').ajaxForm({
			dataType : 'JSON',
			context : this,
			success : function(return_data) {
				if (cl4.process_ajax(return_data)) {
					// validate the payment info and then get the token from Stripe
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
						this.add_messages(step_container, this.payment_error_template({ msgs : validation_msgs }));
						this.processing = false;
						this.remove_loading(step_container);
					} else {
						step_container.find('.js_cart_checkout_box_result').html(return_data.billing_display);

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
					}
				} else {
					if (return_data.redirect) {
						window.location = return_data.redirect;
						return;
					}

					var message_html;
					if (return_data.message_html) {
						message_html = return_data.message_html;
					} else {
						message_html = this.error_template({ error : verify_error });
					}

					this.add_messages(step_container, message_html);
				}
			},
			error : function() {
				step_container.find('.js_cart_checkout_box_messages').html(this.error_template({ error : verify_error }));
				this.processing = false;
				this.remove_loading(step_container);
			}
		})
		.submit();

		return false;
	},

	strip_response_handler : function(status, response) {
		var step_container = cart_public_app.checkout.current_step;
		if (response.error) {
			// show the errors on the form
			this.add_messages(step_container, this.error_template({ error : response.error.message }));
			step_container.find('.js_cart_checkout_box_result').empty();
		} else {
			cart_public_app.checkout.stripe_data = response;

			payment_display = cart_public_app.checkout.payment_display_template({
				card_type : response.card.type,
				last_4 : response.card.last4
			});
			step_container.find('.js_cart_checkout_box_result .js_cart_checkout_payment_display').html(payment_display);

			cart_public_app.checkout.processing = false;
			cart_public_app.checkout.remove_loading(step_container);
			cart_public_app.checkout.goto_next_step(step_container);
		}
	},

	validate_final : function(step_container) {
		this.add_loading(step_container);
		this.clear_messages(step_container);

		var verify_error = 'There was a problem saving your order. Please try again later.';

		this.processing = true;
		step_container.find('.js_cart_checkout_form_final').ajaxForm({
			dataType : 'JSON',
			context : this,
			success : function(return_data) {
				if (cl4.process_ajax(return_data)) {
					step_container.find('.js_cart_checkout_box_result').html(return_data.final_display);
					this.goto_next_step(step_container);
				} else {
					if (return_data.redirect) {
						window.location = return_data.redirect;
						return;
					}

					var message_html;
					if (return_data.message_html) {
						message_html = return_data.message_html;
					} else {
						message_html = this.error_template({ error : verify_error });
					}

					this.add_messages(step_container, message_html);
				}
				this.remove_loading(step_container);
				this.processing = false;
			},
			error : function() {
				step_container.find('.js_cart_checkout_box_messages').html(this.error_template({ error : verify_error }));
				this.processing = false;
				this.remove_loading(step_container);
			}
		})
		.submit();

		return false;
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
			scrollTop: element.offset().top - 10
		}, 500);
	}
});