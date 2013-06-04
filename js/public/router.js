cart_public.router = new (Backbone.Router.extend({
	el : $('.js_cart'),
	routes: {
		'' : 'index'
	},

	initialize : function() {
		$('.js_cart_add_product').on('click', this.add_product);
	},

	start : function() {
		Backbone.history.start({ pushState : true, root : '/' + cart_config.prefix + '/' });
	},

	index : function() {
	},

	/*close_index : function() {
		if (this.month_choose) {
			this.month_choose.undelegateEvents();
		}
	}*/

	add_product : function(e) {
		e.preventDefault();

		var a = $(e.target);

		$.ajax({
			url : a.href,
			dataType : 'JSON',
			type : 'POST'
		}).done(function(return_data) {

		}).fail(function() {

		});
	}
}))();