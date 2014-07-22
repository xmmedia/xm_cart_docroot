$(function() {
	// changing the order filter will submit the form
	$('.js_cart_order_filter_form').on('change', function() {
		this.submit();
	});

	// order status change form
	$('.js_order_status_change_form').on('change', function() {
		var status_select = $(this).find('.js_order_status_change'),
			status = parseInt(status_select.val(), 10);
		if (status) {
			if (status > cart_order_view_data.order.status || confirm('The status you\'ve picked will move the order back in the standard process. Are you sure you want to continue?')) {
				$(this).submit();
			} else {
				status_select.val('');
			}
		}
	});

	// click product name or td will take you to the public product page
	$('.js_cart_product_list').on('click', '.js_col_name', function() {
		window.location = $(this).data('view-url');
	});

	$('.js_cart_order_refund').on('click', function(e) {
		e.preventDefault();

		var c = $('.js_cart_order_action_container'),
			refund_open = false,
			rc; // refund container
		if (c.length > 0) {
			refund_open = (c.is('[data=refund]') ? true : false);
			c.remove();
		}

		// if the refund wasn't open, then open it
		if ( ! refund_open) {
			rc = $(cart_order.refund_template({
					order : cart_order_view_data.order
				}));

			$('.js_cart_order_actions').after(rc);

			rc.find('input[name="refund_type"]').on('change', function() {
				var val = $(this).val(),
					rac = rc.find('.js_refund_amount_container');
				if (val == 'partial') {
					rac.addClass('show').find('input').focus();
				} else {
					rac.removeClass('show');
				}
			});

			rc.find('form').on('submit', function(e) {
				var form = $(this),
					refund_amount_field = form.find('.js_refund_amount'),
					refund_amount = parseFloat(refund_amount_field.val()),
					allow_refund = true;

				if (form.find('input[name="refund_type"]:checked').val() == 'partial') {
					if (refund_amount <= 0) {
						alert('The refund must be greater than $0.00.');
						allow_refund = false;
					} else if (refund_amount > cart_order_view_data.order.final_total) {
						alert('The refund cannot be greater than the order total of ' + cart_order_view_data.order.final_total_formatted + '.');
						allow_refund = false;
					}
				}

				if (allow_refund && ! confirm('Are you sure you want process the refuned? This cannot be undone.')) {
					allow_refund = false;
				}

				if ( ! allow_refund) {
					refund_amount_field.focus();
					e.preventDefault();
				} else {
					form.find('button').attr('disabled', true);
					rc.append(xm.spinner);
				}
			});

			rc.find('.js_close').on('click', function(e) {
				e.preventDefault();
				rc.remove();
			});
		}
	});

	$('.js_cart_order_cancel').on('click', function(e) {
		e.preventDefault();

		var c = $('.js_cart_order_action_container'),
			cancel_open = false,
			cc; // cancel container
		if (c.length > 0) {
			cancel_open = (c.is('[data=cancel]') ? true : false);
			c.remove();
		}

		if ( ! cancel_open) {
			cc = $(cart_order.cancel_template({
					order : cart_order_view_data.order
				}));

			$('.js_cart_order_actions').after(cc);

			cc.find('.js_close').on('click', function(e) {
				e.preventDefault();
				cc.remove();
			});
		}
	});
});

var cart_order = {
	refund_template : Handlebars.compile('<div class="cart_order_action_container js_cart_order_action_container" data-action="refund">'
		+ '<form action="/cart/admin/order/refund/{{order.id}}" method="post" accept-charset="utf-8">'
			+ '<div class="field"><input type="radio" name="refund_type" value="full" id="refund_type_full" checked autofocus><label for="refund_type_full">Refund the Entire Order ({{order.final_total_formatted}})</label></div>'
			+ '<div class="field"><input type="radio" name="refund_type" value="partial" id="refund_type_partial"><label for="refund_type_partial">Refund a Portion of the Total</label>'
				+ '<div class="refund_amount_container js_refund_amount_container"><input type="text" name="refund_amount" value="{{order.final_total}}" size="11" maxlength="11" class="numeric js_refund_amount"></div></div>'
			+ '<div class="field"><input type="checkbox" name="send_email" value="1" checked id="send_email"><label for="send_email">Send Updated Order to Customer</label></div>'
			+ '<div class="buttons"><button>Process Refund</button><a href="" class="js_close">Close</a></div>'
		+ '</form>'
		+ '</div>'),
	cancel_template : Handlebars.compile('<div class="cart_order_action_container js_cart_order_action_container" data-action="cancel">'
		+ '<div>Are you sure you want to cancel and refund the balance ({{order.final_total_formatted}}) this order?</div>'
		+ '<form action="/cart/admin/order/refund/{{order.id}}" method="post" accept-charset="utf-8">'
			+ '<div class="field"><input type="checkbox" name="send_email" value="1" checked id="send_email"><label for="send_email">Send Updated Order to Customer</label></div>'
			+ '<div class="buttons"><input type="hidden" name="cancel_order" value="1"><button autofocus>Yes, Cancel &amp; Refund the Order</button><a href="" class="js_close">Close</a></div>'
		+ '</form>'
		+ '</div>')
};