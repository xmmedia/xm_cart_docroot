cart_public_app.views.cart_product = Backbone.View.extend({
	tagName : 'li',
	template : Handlebars.compile('{{name}} {{quantity}} x {{cost_formatted}}'),

	render : function() {
		this.$el.html(this.template(this.model.attributes));

		return this;
	}
});