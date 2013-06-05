cart_public_app.views.cart = Backbone.View.extend({
	el : $('.js_cart'),

	template : Handlebars.compile('<ul></ul>'),

	initialize : function() {
		this.collection.on('change', this.render, this);
	},

	render : function() {
		var ul = this.template();

		this.collection.forEach(function(order_product) {
			ul.append((new cart_public_app.views.cart_product({ model : order_product })).render().el);
		});

		this.$el.append(ul);

		return this;
	}
});