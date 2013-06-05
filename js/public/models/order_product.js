cart_public_app.models.order_product = Backbone.Model.extend({
	url : 'save_product',

	initialize : function(attributes) {
		this.set('id', parseInt(attributes.id, 0));
		this.set('cart_product_id', parseInt(attributes.cart_product_id, 0));
		this.set('quantity', parseInt(attributes.quantity, 0));
		this.set('unit_price', parseFloat(attributes.unit_price));
	}
});