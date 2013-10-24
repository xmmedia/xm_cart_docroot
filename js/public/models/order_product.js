cart_public_app.models.order_product = Backbone.Model.extend({
	parse: function(resp, options) {
		// make sure some values are actual ints, not strings
		_.each([ 'id', 'cart_product_id', 'quantity' ], function(field) {
			if (typeof resp[field] !== undefined) {
				resp[field] = parseInt(resp[field], 10);
			}
		});

		resp.unit_price = parseFloat(resp.unit_price);
		resp.amount = parseFloat(resp.amount);

		return resp;
	}
});