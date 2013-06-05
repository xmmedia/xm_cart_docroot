cart_public_app.views.cart_product = Backbone.View.extend({
	tagName : 'li',
	template : Handlebars.compile('{{name}} <input type="text" size="3" maxlength="6" value="{{quantity}}" class="text_right js_cart_order_product_quantity"> x {{cost_formatted}} <a href="/{{cart_prefix}}/remove_product" class="js_cart_order_product_remove">Remove</a>'),

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
		var quantity = parseInt($(e.target).val(), 0);
		if (quantity > 0) {
			this.model.set('quantity', quantity);
		} else {
			this.remove_product();
		}
	},

	remove_product : function(e) {
		if (e) {
			e.preventDefault();
		}

		this.model.destroy();
	}
});