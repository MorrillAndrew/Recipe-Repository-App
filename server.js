var fs = require('fs');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var recipeContent = require('./Recipe');
var port = process.env.PORT || 3000;

// Use Handlebars as the view engine for the app.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

// Server index for root request
app.get('/', function(req,res) {
	res.render('index-page',{
		title: "Recipe Repository Home"
	});
});

// Sever static files on request
app.get('/style.css', function(req, res){
	res.render('style.css');
});

app.get('/index.js', function(req, res){
	res.render('index.js');
});

//////////////////////////////

app.get('/categories', function(req, res) {
	res.status(200).render('index-page', {
		title: "~Categories~",
		category: recipeContent
	});
});

app.get('/categories/:category', function(req, res, next) {
	var requestedCategory = recipeContent[req.params.category];
	if (requestedCategory) {
		res.status(200).render('index-page', {
			title: requestedCategory.category,
			// category: requestedCategory,
			recipes: requestedCategory.recipes
		});
	} else {
		next();
	}
});
///////////////

// Catch all for 404
app.get('*', function (req, res) {
  res.render('404-page', {
  	title: "Error Page"
  });
});

// Listen on the specified port.
app.listen(port, function () {
  console.log("== Listening on port", port);
});
