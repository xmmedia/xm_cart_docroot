cart_public_app.views.totals = Backbone.View.extend({
	total_template : Handlebars.compile('<tr class="total_row{{#if grand_total}} grand_total{{/if}}">' +
			'<td class="col_name"></td>' +
			'<td class="col_unit_price" colspan="2">{{name}}</td>' +
			'<td class="col_amount">{{total}}</td>' +
			'<td class="col_remove"></td>' +
		'</tr>'
	),

	render : function() {
		var total_vars = {
			name : 'Sub Total',
			total : this.model.get('sub_total_formatted')
		};
		this.$el.append(this.total_template(total_vars));

		total_vars.name = 'Total';
		total_vars.total = this.model.get('total_formatted');
		total_vars.grand_total = true;
		this.$el.append(this.total_template(total_vars));

		return this;
	}
});