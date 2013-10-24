cart_public_app.views.totals = Backbone.View.extend({
	total_template : Handlebars.compile(
		'<tr class="total_row{{#if is_grand_total}} grand_total{{/if}}">' +
			'<td class="col_name"></td>' +
			'<td class="col_unit_price" colspan="2">{{name}}</td>' +
			'<td class="col_amount">{{total}}</td>' +
			'<td class="col_remove"></td>' +
		'</tr>'
	),

	// note: events cannot be applied to this view because we remove the parent element we adding it to the cart table

	render : function() {
		this.collection.each(function(total_row) {
			this.$el.append(this.total_template({
				name : total_row.get('name'),
				total : total_row.get('value_formatted'),
				is_grand_total : total_row.get('is_grand_total')
			}));
		}, this);

		return this;
	}
});