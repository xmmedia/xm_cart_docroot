cart_public_app.collections.order_products = Backbone.Collection.extend({
	model : cart_public_app.models.order_product,
	url : 'load_products',

	retrieve : function() {
		var collection = this;

		if (cart_public_app.router && cart_public_app.router.cart) {
			cart_public_app.router.cart.loading();
		}

		this.fetch({
			success : function() {
				cart_public_app.router.cart = (new cart_public_app.views.cart({ collection : collection })).render();
			}
		});

		return this;
	}
});