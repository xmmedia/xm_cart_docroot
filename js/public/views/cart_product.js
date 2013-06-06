cart_public_app.views.cart_product = Backbone.View.extend({
	tagName : 'tr',
	template : Handlebars.compile(
		'<td class="col_name">{{name}}</td>' +
		'<td class="col_quantity"><input type="text" size="3" maxlength="6" value="{{quantity}}" class="text_center js_cart_order_product_quantity"></td>' +
		'<td class="col_unit_price">{{unit_price_formatted}}</td>' +
		'<td class="col_amount">{{amount_formatted}}</td>' +
		'<td class="col_remove"><a href="/{{cart_prefix}}/remove_product" class="js_cart_order_product_remove">X</a></td>'
	),
	loading_div_template : Handlebars.compile('<div style="display: inline-block; text-align: center; width: 100%;"><img src="/images/loading.gif"></div>'),

	events : {
		'change .js_cart_order_product_quantity' : 'quantity_changed',
		'click .js_cart_order_product_remove' : 'remove_product'
	},

	render : function() {
		var template_vars = _.clone(this.model.attributes);
		template_vars.cart_prefix = cart_config.prefix;

		this.$el.html(this.template(template_vars));

		return this;
	},

	quantity_changed : function(e) {
		this.$('.js_cart_order_product_quantity').replaceWith(this.loading_div_template());

		this.model.set('quantity', $(e.target).val());

		this.ajax_action('change_quantity');
	},

	remove_product : function(e) {
		e.preventDefault();

		this.ajax_action('remove_product');
	},

	ajax_action : function(action) {
		$.ajax({
			url : '/' + cart_config.prefix + '/' + action,
			data : {
				cart_order_product_id : this.model.get('id'),
				quantity : this.model.get('quantity')
			},
			method : 'POST',
			dataType : 'JSON',
			context : this
		}).done(function() {
			cart_public_app.router.order_products.retrieve();
		}).fail(function() {
			cart_public_app.router.order_products.retrieve();
		});
	}
});