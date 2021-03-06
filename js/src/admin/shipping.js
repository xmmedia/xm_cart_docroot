$(function() {
	// on the list of shipping rates
	if ($('.js_cart_shipping_list').length > 0) {
		$('.js_delete_shipping').on('click', function(e) {
			if ( ! confirm('Are you sure you want to delete the shipping rate "' + $(this).data('name') + '"?' + "\n\n" + 'Note: Removing the shipping rate will not affect any orders that have already been completed.')) {
				e.preventDefault();
			}
		});
	}

	// on the shipping rate edit
	if ($('.js_cart_form_shipping').length > 0) {
		$('.js_shipping_reason').on('change', function() {
			xm_cart_shipping.reason_change(this);
		}).each(function(i, select) {
			xm_cart_shipping.reason_change(select);
		});

		$('.js_shipping_calc_method').on('change', function() {
			var method = $(this).find(':checked').val(),
				amount_container = $('.js_shipping_amount');
			// free, therefore no amount
			if (method == 'f') {
				amount_container.slideUp().val('');
				amount_container.find('.js_symbol').remove();

			// other, show amount
			} else {
				amount_container.slideDown()
					.find('.js_symbol').remove();
				if (method == '$') {
					amount_container.find('input').before('<span class="js_symbol">$</span>');
				} else if (method == '%') {
					amount_container.find('input').after('<span class="js_symbol">%</span>');
				}
			}
		}).change();
	}
});

var xm_cart_shipping = {
	reason_help : {
		flat_rate : 'The same shipping rate will be applied to all orders, no matter their total or shipping address.',
		sub_total : 'This shipping rate will used when the order total before taxes and shipping is between two amounts or greater than an amount.',
		shipping_address : 'This shipping rate will be used when the order is being shipping to certain geographic areas.'
	},

	reason_change : function(select) {
		var val = $(select).val(),
			reason_container = $(select).closest('.js_reason_container'),
			help_container = reason_container.find('.js_reason_help'),
			detail_container = reason_container.find('.js_reason_details');

		if (val) {
			help_container.html(xm_cart_shipping.reason_help[val]);
			xm_cart_shipping.reason_detail(val, reason_container);
		} else {
			help_container.empty();
			detail_container.empty();
		}
	},

	reason_detail : function(reason, c) {
		var count = c.data('reason-count'),
			reason_data = c.data('reason-data'),
			detail_container = c.find('.js_reason_details');

		reason_data_defaults = {
			reason : reason,
			is_between : true,
			min : (cart_shipping_admin_config.sub_total_last > 0 ? cart_shipping_admin_config.sub_total_last + 0.01 : 0),
			max : cart_shipping_admin_config.sub_total_last + 100,
			count : count
		};
		reason_data_defaults.greater_than = reason_data.min;

		if ( ! reason_data) {
			reason_data = reason_data_defaults;
		} else {
			reason_data.is_between = (typeof reason_data.greater_than === 'undefined' ? true : false);

			// merge in the defaults so they're all there
			reason_data = _.defaults(reason_data, reason_data_defaults);
		}

		if (reason == 'sub_total') {
			var fields;
			if (reason_data.is_between) {
				fields = xm_cart_shipping.reason_sub_total_min_max(reason_data);
			} else {
				fields = xm_cart_shipping.reason_sub_total_greater_than(reason_data);
			}
			detail_container.html(xm_cart_shipping.reason_sub_total_template({
				count : count,
				is_between : reason_data.is_between,
				fields : fields
			}));

			detail_container.find('.js_reason_type').on('change', function() {
				var type = $(this).find(':checked').val(),
					field_container = detail_container.find('.js_reason_fields');
				if (type == 'greater_than') {
					field_container.html(xm_cart_shipping.reason_sub_total_greater_than(reason_data));
				} else {
					field_container.html(xm_cart_shipping.reason_sub_total_min_max(reason_data));
				}
			});

		} else if (reason == 'shipping_address') {
			detail_container.html(xm_cart_shipping.reason_shipping_address_template({
				count : cart_shipping_admin_config.reason_count
			}));

		} else {
			detail_container.empty();
		}
	},

	reason_sub_total_template : Handlebars.compile(
		'<div class="field checkbox js_reason_type" data-reason_count="{{count}}">'
			+ '<input type="radio" name="reasons[{{count}}][type]" value="between"{{#if is_between}} checked{{/if}} id="reason_{{count}}_type_between"><label for="reason_{{count}}_type_between">Range</label>'
			+ '<input type="radio" name="reasons[{{count}}][type]" value="greater_than"{{#unless is_between}} checked{{/unless}} id="reason_{{count}}_type_greater_than"><label for="reason_{{count}}_type_greater_than">Above</label>'
		+ '</div>'
		+ '<div class="js_reason_fields">{{{fields}}}</div>'
	),

	reason_sub_total_min_max : Handlebars.compile(
		'<div class="field"><label for="reason_{{count}}_min">Sub Total Minimum</label>$<input type="text" name="reasons[{{count}}][min]" value="{{min}}" size="11" maxlength="11" id="reason_{{count}}_min" class="numeric"></div>'
		+ '<div class="field"><label for="reason_{{count}}_max">Sub Total Maximum</label>$<input type="text" name="reasons[{{count}}][max]" value="{{max}}" size="11" maxlength="11" id="reason_{{count}}_max" class="numeric"></div>'
	),

	reason_sub_total_greater_than : Handlebars.compile(
		'<div class="field"><label for="reason_{{count}}_greater_than">Sub Total Of or Above</label>$<input type="text" name="reasons[{{count}}][greater_than]" value="{{greater_than}}" size="11" maxlength="11" id="reason_{{count}}_greater_than" class="numeric"></div>'
	),

	reason_shipping_address_template : Handlebars.compile('<div class="field">coming soon...</div>')
}