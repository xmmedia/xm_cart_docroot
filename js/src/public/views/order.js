cart_public_app.views.order = Backbone.View.extend({
	el : $('.js_view_order'),

	events : {
		'click .js_col_name' : 'view_product'
	},

	view_product : function(e) {
		var target = $(e.target),
			col_name;

		if ( ! target.is('.js_col_name')) {
			col_name = target.closest('.js_col_name');
		} else {
			col_name = target;
		}

		window.location = col_name.data('view-url');
	}
});