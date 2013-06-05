cart_public_app.models.order_product = Backbone.Model.extend({
	urlRoot : 'save_product',

	parse: function(resp, options) {
		// make sure some values are actual ints, not strings
		_.each([ 'id', 'cart_product_id', 'quantity' ], function(field) {
			if (typeof resp[field] !== undefined) {
				resp[field] = parseInt(resp[field], 0);
			}
		});

		resp.unit_price = parseFloat(resp.unit_price);

		return resp;
	}
});