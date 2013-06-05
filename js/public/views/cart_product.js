cart_public_app.views.cart_product = Backbone.View.extend({
	tagName : 'li',
	template : Handlebars.compile('{{name}} <input type="text" size="3" maxlength="6" value="{{quantity}}" class="text_right js_cart_order_product_quantity"> x {{cost_formatted}}'),

	events : {
		'change .js_cart_order_product_quantity' : 'quantity_changed'
	},

	render : function() {
		this.$el.html(this.template(this.model.attributes));

		return this;
	},

	quantity_changed : function(e) {
		var quantity = parseInt($(e.target).val(), 0);
		if (quantity > 0) {
			this.model.set('quantity', quantity);
		} else {
			this.model.destroy();
		}
	}
});