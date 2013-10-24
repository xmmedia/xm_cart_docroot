cart_public_app.views.totals = Backbone.View.extend({
	total_template : Handlebars.compile(
		'<tr class="total_row{{#if is_grand_total}} grand_total{{/if}}">' +
			'<td class="col_name"></td>' +
			'<td class="col_unit_price" colspan="2">{{name}}</td>' +
			'<td class="col_amount">{{total}}</td>' +
			'<td class="col_remove"></td>' +
		'</tr>'
	),
	shipping_location_select_template : Handlebars.compile(
		'<tr class="location_select">' +
			'<td class="col_label">{{location_select_msg}}</td>' +
			'<td class="col_location_select js_location_select" colspan="3">{{{country_select}}}</td>' +
			'<td class="col_remove"></td>' +
		'</tr>'
	),
	shipping_country_select_template : Handlebars.compile('<select name="" class="js_cart_location_country_id"><option value="">-- Select Your Shipping Country --</option>{{#each countries}}<option value="{{id}}">{{name}}</option>{{/each}}</select>'),
	shipping_state_select_template : Handlebars.compile('<select name="" class="js_cart_location_state_id"><option value="">-- Select Your Shipping Province/State --</option>{{#each states}}<option value="{{id}}">{{name}}</option>{{/each}}</select>'),
	// messages that appear beside the location select depending on if the shipping & tax functionality is enabled
	location_select_msgs : {
		both : 'To calculate the tax and shipping, select your location:',
		only_shipping : 'To calculate the shipping, select your location:',
		only_tax : 'To calculate the tax, select your location:'
	},

	// note: events cannot be applied to this view because we remove the parent element we adding it to the cart table

	render : function() {
		this.collection.each(function(total_row) {
			this.$el.append(this.total_template({
				name : total_row.get('name'),
				total : total_row.get('value_formatted'),
				is_grand_total : total_row.get('is_grand_total')
			}));
		}, this);

		if (this.options.order.get('show_location_select')) {
			if (cart_config.enable_shipping && cart_config.enable_tax) {
				location_select_msg = this.location_select_msgs.both;
			} else if (cart_config.enable_shipping) {
				location_select_msg = this.location_select_msgs.only_shipping;
			} else if (cart_config.enable_tax) {
				location_select_msg = this.location_select_msgs.only_tax;
			}

			var country_select = this.shipping_country_select_template({ countries : cart_config.countries });
			this.$el.append(this.shipping_location_select_template({
				country_select : country_select,
				location_select_msg : location_select_msg
			}));
		}

		return this;
	}
});