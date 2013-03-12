$(document).ready(function() {
	var handler = 'handler.php';

	function searchBooks(searchKey) {
		$.ajax({
			type: 'GET',
			url: handler + "?search=" + encodeURI(searchKey),
			dataType: "json"
		});
	}

	var app = {};

	var editing = false;

	app.Book = Backbone.Model.extend({
		defaults: {
			id: -1,
			name: '',
			author: '',
			status: 0
		}
	});

	app.BookList = Backbone.Collection.extend({
		model: app.Book,

		filterByName: function(name) {
			if (name === null || name === '')
				return this;
			return _(this.filter(function(book) {
				return book.get("name").indexOf(name) !== -1;
			}));
		}
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
				$.ajax({
					type: 'POST',
					contentType: 'application/json',
					url: handler,
					dataType: "json",
					data: data,
					success: function(data, textStatus, jqXHR) {
						self.model.save({name: value1, author: value2, status: value3});
					},
					error: function(jqXHR, textStatus, errorThrown) {
						alert('There was an error while updating a book: ' + textStatus);
					}
				});
			}
			editing = false;
			this.$el.removeClass('editing');
		},
		deleteItem: function() {
			var self = this;
			$.ajax({
				type: 'GET',
				url: handler + '?delete=' + self.model.get("id"),
				success: function(data, textStatus, jqXHR) {
					app.bookList.remove(self.model);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					alert('There was an error while deleting a book: ' + textStatus);
				}
			});
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

			this.read();
		},
		read: function() {
			$.ajax({
				type: 'GET',
				url: handler,
				dataType: "json",
				success: function(data) {
					app.bookList.reset(data.book);
				}
			});
		},
		events: {
			'click #add_book': 'createBook',
			'keyup #input_search': 'search'
		},
		createBook: function() {
			if (this.input_name.val().trim() !== '' && this.input_author.val().trim() !== '') {
				var self = this;
				
				var data = JSON.stringify({
						"name": this.input_name.val(),
						"author": this.input_author.val(),
						"status": this.input_status.val(),
						"type": "add"
				});

				$.ajax({
					type: 'POST',
					contentType: 'application/json',
					url: handler,
					dataType: "json",
					data: data,
					success: function(data, textStatus, jqXHR) {
						self.input_name.val("");
						self.input_author.val("");
						self.input_status.val(0);
						self.read();
					},
					error: function(jqXHR, textStatus, errorThrown) {
						alert('There was an error while saving a book: ' + textStatus);
					}
				});
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
			app.bookList.each(this.addOne, this);
		},
		newAttributes: function() {
			return {
				name: this.input_name.val(),
				author: this.input_author.val(),
				status: this.input_status.val()
			};
		},
		search: function() {
			$.ajax({
				type: 'GET',
				url: handler + "?search=" + encodeURI($('#input_search').val()),
				dataType: "json",
				success: function(data) {
					app.bookList.reset(data.book);
				}
			});
		}
	});

	app.appView = new app.AppView();
});

