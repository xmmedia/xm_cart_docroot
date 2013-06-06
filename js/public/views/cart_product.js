cart_public_app.views.cart_product = Backbone.View.extend({
	tagName : 'li',
	template : Handlebars.compile('{{name}} <input type="text" size="3" maxlength="6" value="{{quantity}}" class="text_right js_cart_order_product_quantity"> x {{cost_formatted}} <a href="/{{cart_prefix}}/remove_product" class="js_cart_order_product_remove">Remove</a>'),
	loading_div_template : Handlebars.compile('<div style="display: inline-block; text-align: center; width: {{width}}px; height: {{height}}px;"><img src="/images/loading.gif"></div>'),

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
		var quantity = parseInt($(e.target).val(), 0),
			quantity_field = this.$('.js_cart_order_product_quantity'),
			loading_div = $('<div>', { style : 'width: ' });


		quantity_field.replaceWith(this.loading_div_template({
			width : quantity_field.outerWidth(),
			height : quantity_field.outerHeight()
		}));

		$.ajax({
			url : '/' + cart_config.prefix + '/change_quantity',
			data : {
				cart_order_product_id : this.model.get('id'),
				quantity : quantity
			},
			method : 'POST',
			dataType : 'JSON',
			context : this,
			success : function() {
				cart_public_app.router.order_products.retrieve();
			},
			error : function() {
				cart_public_app.router.order_products.retrieve();
			}
		});
	},

	remove_product : function(e) {
		if (e) {
			e.preventDefault();
		}

		this.model.destroy();
	}
});