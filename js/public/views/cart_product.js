cart_public_app.views.cart_product = Backbone.View.extend({
	tagName : 'tr',
	template : Handlebars.compile(
		'<td class="col_name">{{#if show_product_photo}}<div class="photo"><img src="{{photo_uri}}"></div>{{/if}}{{name}}{{#if description}}<div class="product_description">{{description}}</div>{{/if}}</td>' +
		'<td class="col_quantity"><input type="text" size="3" maxlength="6" value="{{quantity}}" class="cart_order_product_quantity js_cart_order_product_quantity"><br><a href="" class="cart_order_product_update_quantity js_cart_order_product_update_quantity">Update</a></td>' +
		'<td class="col_unit_price">{{unit_price_formatted}}</td>' +
		'<td class="col_amount">{{amount_formatted}}</td>' +
		'<td class="col_remove"><a href="/{{cart_route_prefix}}/remove_product" class="js_cart_order_product_remove" title="Remove Item from Cart">X</a></td>'
	),
	donation_template : Handlebars.compile(
		'<td class="col_name">{{name}}{{#if description}}<div class="product_description">{{description}}</div>{{/if}}</td>' +
		'<td class="col_amount">{{amount_formatted}}</td>'
	),
	loading_div_template : Handlebars.compile('<div class="cart_product_loading_container">' + cart_public_app.loading_template() + '</div>'),

	events : {
		'change .js_cart_order_product_quantity' : 'quantity_changed',
		'click .cart_order_product_update_quantity' : 'update_quantity',
		'click .js_cart_order_product_remove' : 'remove_product'
	},

	initialize : function(options) {
		this.options || (this.options = {});

		this.options.donation_cart = options.donation_cart;
	},

	render : function() {
		var template_vars = _.clone(this.model.attributes);
		template_vars.cart_route_prefix = cart_config.route_prefix;
		template_vars.show_product_photo = cart_config.show_product_photo;

		if (this.options.donation_cart) {
			this.$el.html(this.donation_template(template_vars));
		} else {
			this.$el.html(this.template(template_vars));
		}

		return this;
	},

	quantity_changed : function() {
		var quantity_field = this.$('.js_cart_order_product_quantity');
		if (quantity_field.length > 0) {
			this.model.set('quantity', quantity_field.val());

			this.$('.js_cart_order_product_quantity').replaceWith(this.loading_div_template());

			cart_public_app.ajax_action('change_quantity', {
				cart_order_product_id : this.model.get('id'),
				quantity : this.model.get('quantity')
			});
		}
	},

	update_quantity : function(e) {
		e.preventDefault();

		this.quantity_changed();
	},

	remove_product : function(e) {
		e.preventDefault();

		cart_public_app.ajax_action('remove_product', {
			cart_order_product_id : this.model.get('id'),
			quantity : this.model.get('quantity')
		});
	}
});