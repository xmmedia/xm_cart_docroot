cart_public_app.models.total = Backbone.Model.extend({
	parse: function(resp, options) {
		// make sure some values are actual floats, not strings
		_.each([ 'value' ], function(field) {
			if (typeof resp[field] !== undefined) {
				resp[field] = parseFloat(resp[field]);
			}
		});

		return resp;
	}
});