$(document).ready(function() {
	var handler = 'handler.php';

	var app = {};

	var editing = false;

	app.Book = Backbone.Model.extend({
		url: function() {
			return handler + "/" + this.id;
		},

		defaults: {
			name: '',
			author: '',
			status: 0
		}
	});

	app.BookList = Backbone.Collection.extend({
		model: app.Book,
		url: handler
	});

	app.bookList = new app.BookList();

	app.BookView = Backbone.View.extend({
		tagName: 'div',
		template: _.template($('#item-template').html()),
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		initialize: function() {
			this.model.on('change', this.render, this);
			this.model.on('destroy', this.remove, this);
		},
		events: {
			'click .delete': 'deleteItem',
			'hover .view': 'select',
			'mouseleave .view': 'unselect',
			'click .editbtn': 'edit',
			'click .update': 'saveEdit',
			'click .cancel': 'cancelEdit'
		},
		edit: function() {
			editing = true;
			this.$el.addClass('editing');

			this.$('.edit_name').val(this.$('.book_name').html());
			this.$('.edit_author').val(this.$('.book_author').html());
			this.$('.edit_status').val(this.$('.book_status').html() === "Read" ? 1 : 0);
			this.$('.edit_name').focus();
		},
		cancelEdit: function() {
			this.$el.removeClass('editing');
			editing = false;
		},
		saveEdit: function() {
			var value1 = this.$('.edit_name').val().trim();
			var value2 = this.$('.edit_author').val().trim();
			var value3 = this.$('.edit_status').val();
			
			var self = this;
			
			var data = JSON.stringify({
						"id": self.model.get("id"),
						"name": value1,
						"author": value2,
						"status": value3,
						"type": "update"
			});
			
			if (value1 && value2) {
				this.model.save({
					name: value1,
					author: value2,
					status: value3
				});
			}
			editing = false;
			this.$el.removeClass('editing');
		},
		deleteItem: function() {
			this.model.destroy();
		},
		select: function() {
			if (!editing) {
				$(this.el).addClass("selected");
			}
		},
		unselect: function() {
			if (!editing) {
				this.$el.removeClass('selected');
			}
		}
	});

	app.AppView = Backbone.View.extend({
		
		el: '#container',
		initialize: function() {
			this.input_name = $('#input_name');
			this.input_author = $('#input_author');
			this.input_status = $('#input_status');
			app.bookList.on('add', this.addAll, this);
			app.bookList.on('reset', this.addAll, this);
			app.bookList.on('remove', this.addAll, this);

			app.bookList.fetch();
		},
		events: {
			'click #add_book': 'createBook',
			'keyup #input_search': 'search'
		},
		createBook: function() {
			if (this.input_name.val().trim() !== '' && this.input_author.val().trim() !== '') {
				var book = new app.Book({
						name: this.input_name.val(),
						author: this.input_author.val(),
						status: this.input_status.val(),
						type: "add"
				});
				
				book.save();
				app.bookList.add(book);
			}
		},
		addOne: function(book) {
			view = new app.BookView({model: book});
			$('#book-list').append(view.render().el);
			$(view.el).addClass("item");
			//view.unselect();
		},
		addAll: function() {
			this.$('#book-list').html('');
//			app.bookList.each(this.addOne, this);
			var text = $('#input_search').val().toUpperCase();
			_(app.bookList.models.filter(function(book) { return (book.get("name").toUpperCase()).indexOf(text) !== -1; })).each(this.addOne, this);
		},
		search: function() {
			app.bookList.fetch();
		}
	});

	app.appView = new app.AppView();	
	

});
