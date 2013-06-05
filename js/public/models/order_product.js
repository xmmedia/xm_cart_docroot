cart_public_app.models.order_product = Backbone.Model.extend({
	urlRoot : 'save_product',

	parse: function(resp, options) {
		_.each([ 'id', 'cart_product_id', 'quantity' ], function(field) {
			if (resp[field]) {
				resp[field] = parseInt(resp[field], 0);
			}
		});

		resp.unit_price = parseFloat(resp.unit_price);

		return resp;
	}
});