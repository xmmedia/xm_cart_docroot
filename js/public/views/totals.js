cart_public_app.views.totals = Backbone.View.extend({
	total_template : Handlebars.compile(
		'<tr class="total_row{{#if grand_total}} grand_total{{/if}}">' +
			'<td class="col_name"></td>' +
			'<td class="col_unit_price" colspan="2">{{name}}</td>' +
			'<td class="col_amount">{{total}}</td>' +
			'<td class="col_remove"></td>' +
		'</tr>'
	),
	shipping_location_select_template : Handlebars.compile(
		'<tr class="location_select">' +
			'<td class="col_label">To calculate the tax and shipping, select your location:</td>' +
			'<td class="col_location_select js_location_select" colspan="3">{{{country_select}}}</td>' +
			'<td class="col_remove"></td>' +
		'</tr>'
	),
	shipping_country_select_template : Handlebars.compile('<select name="" class="js_cart_location_country_id"><option value="">-- Select Your Shipping Country --</option>{{#each countries}}<option value="{{id}}">{{name}}</option>{{/each}}</select>'),
	shipping_state_select_template : Handlebars.compile('<select name="" class="js_cart_location_state_id"><option value="">-- Select Your Shipping Province/State --</option>{{#each states}}<option value="{{id}}">{{name}}</option>{{/each}}</select>'),

	// note: events cannot be applied to this view because we remove the parent element we adding it to the cart table

	render : function() {
		var total_vars = {};

		total_vars.name = 'Sub Total';
		total_vars.total = this.model.get('sub_total_formatted');
		this.$el.append(this.total_template(total_vars));

		if (this.model.get('show_location_select')) {
			var country_select = this.shipping_country_select_template({ countries : cart_config.countries });
			this.$el.append(this.shipping_location_select_template({ country_select : country_select }));
		}

		_.each(this.model.get('taxes'), function(tax) {
			total_vars.name = tax.name;
			total_vars.total = tax.amount_formatted;
			this.$el.append(this.total_template(total_vars));
		}, this);

		total_vars.name = 'Total';
		total_vars.total = this.model.get('grand_total_formatted');
		total_vars.grand_total = true;
		this.$el.append(this.total_template(total_vars));

		return this;
	}
});