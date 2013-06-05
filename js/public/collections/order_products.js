cart_public_app.collections.order_products = Backbone.Collection.extend({
	model : cart_public_app.models.order_product,
	url : 'load_products',

	retrieve : function() {
		var collection = this;

		this.fetch({
			success : function() {
				// if ( ! cart_public_app.router.cart) {
					cart_public_app.router.cart = new cart_public_app.views.cart({ collection : collection });
					cart_public_app.router.cart.render();
				// } else {
					// cart_public_app.router.cart.collection.fetch();/*.reset(collection)
						// .render();*/
				// }
			}
		});

		return this;
	}
});