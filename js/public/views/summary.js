cart_public_app.views.summary = Backbone.View.extend({
	template : Handlebars.compile(
		'<span class="cart_summary_section js_cart_summary_items">{{product_count}}</span>' +
		'<span class="cart_summary_section js_cart_summary_total">{{total}}</span>'
	),

	data : {
		product_count : 0,
		total : 0,
		total_formatted : '$0.00'
	},

	retrieve : function() {
		this.loading();

		cart_public_app.ajax_action('load_summary', {}, {
			done : function(return_data) {
				if (xm.process_ajax(return_data)) {
					cart_public_app.summary.data.product_count = return_data.product_count;
					cart_public_app.summary.data.total = return_data.total;
					cart_public_app.summary.data.total_formatted = return_data.total_formatted;

					cart_public_app.summary.render();
				} else {
					cart_public_app.summary.failed();
				}
			},
			fail : function(return_data) {
				xm.process_ajax(return_data);
				cart_public_app.summary.failed();
			}
		});

		return this;
	},

	failed : function() {
		this.remove_loading();
	},

	loading : function() {
		// just incase, remove the "loading"
		this.remove_loading();

		// set the width so loading doesn't make it jump around
		this.$el.width(this.$el.width());
		// remove items and totals elements
		this.$el.find('.js_cart_summary_items, .js_cart_summary_total').remove();
		this.$el.append('<span class="js_loading">Loading...</span>');
	},

	remove_loading : function() {
		this.$el.find('.js_loading').remove();
	},

	render : function() {
		this.remove_loading();

		this.$el.append(this.template({
			product_count : this.data.product_count + ' item' + (this.data.product_count != 1 ? 's' : ''),
			total : this.data.total_formatted
		}));

		this.$el.width('auto');
	}
});