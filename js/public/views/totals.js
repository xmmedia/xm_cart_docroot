cart_public_app.views.totals = Backbone.View.extend({
	total_template : Handlebars.compile('<tr>' +
			'<td class="col_name" colspan="2"></td>' +
			'<td class="col_unit_price">{{name}}</td>' +
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
		this.$el.append(this.total_template(total_vars));

		return this;
	}
});