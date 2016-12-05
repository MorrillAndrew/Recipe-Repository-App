var fs = require('fs');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();
var recipeContent = require('./Recipe');
var port = process.env.PORT || 3000;

// Set up persistant DB connection
var connection = mysql.createConnection({
  host: "mysql.cs.orst.edu",
  user: "cs290_whitlocn",
  password: "2093",
  database: "cs290_whitlocn"
});



// Use Handlebars as the view engine for the app.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Parse all request bodies as JSON
app.use(bodyParser.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Server index for root request
app.get('/', function(req,res) {
	res.render('index-page',{
		title: "Recipe Repository Home"
	});
});

// app.post("/search", function (req, res) {
//     console.log(req.body.name);
//     res.send("== req.body",req.body);
// });

// Get information submitted
app.post('/search', function(req, res) {
   	//console.log(req.body);
   	var searchTarget = req.body[0].value;
   	successful_return = [];

   	// Set up query to search through recipe names
   	// and ingredients looking for something like
   	// %query%
   	connection.query("SELECT DISTINCT recipe_name \
   		FROM recipe_name JOIN ingredients \
   		ON recipe_name.recipe_id = ingredients.recipe_id \
   		WHERE recipe_name RLIKE '" + searchTarget + "' \
   		OR ingredient_value RLIKE '" + searchTarget + "'", function(err, rows) {
    if (err) {
        console.log("== Error fectching recipes from DB: ", err);
		res.status(500).send("Error fetching recipes: " + err);
    } else {
        //console.log("rows: ", rows);
        rows.forEach(function(row) {
	        successful_return.push({
	            value: row.recipe_name        
	        });
      	});

      	console.log("== successful_return", successful_return);

      	res.render('index-page', {
			title: "Results",
			success: successful_return
    	});
   		//res.status(200).send(successful_return);


      }
 	});
 	//console.log("== successful_return", successful_return);
   	console.log("You sent the name " + req.body[0].name + " and the address " + req.body[0].value);
    //res.send("ok");
});

app.get('/categories', function(req, res) {
	res.status(200).render('index-page', {
		title: "~Categories~",
		category: recipeContent
	});
});



// app.get('/categories/:category', function(req, res, next) {
// 	var requestedCategory = recipeContent[req.params.category];
// 	if (requestedCategory) {
// 		res.status(200).render('index-page', {
// 			title: requestedCategory.category,
// 			recipes: requestedCategory.recipes
// 		});
// 	} else {
// 		next();
// 	}
// });

app.get('/categories/:category', function(req, res, next) {

  var requestedRecipes = [];

	connection.query("SELECT * FROM recipe_name WHERE recipe_category = '" + req.params.category + "'", function(err, rows) {
    if (err) {
      console.log("== Error fectching recipes from DB: ", err);
			res.status(500).send("Error fetching recipes: " + err);
    } else {
      rows.forEach(function(row) {
        // console.log("row: " + row.recipe_name);
        requestedRecipes.push({
          // row: {
            recipe_name:row.recipe_name,
  					recipe_category: row.recipe_category,
  					prep_time: row.prep_time,
  					cook_time: row.cook_time,
  					temp: row.temp,
  					yield: row.yeild
          // }
        });
      });
      if (requestedRecipes.length > 0) {
        for (var i = 0; i < requestedRecipes.length; i++) {console.log(requestedRecipes[i]);}
    		res.status(200).render('index-page', {
    			title: requestedRecipes[0].recipe_category,
    			recipes: requestedRecipes
    		});
      } else {
        next();
      }
      // console.log(requestedRecipes);
    }
  });
});

// Temp handler to test sql rendering
app.get('/mysql', function(req,res){

	// Arrays for connection one
	var recipeMain = [];
	var recipeIDs = [];

	// Arrays for further connections
	var equipment = [];
	var ingredients = [];
	var stepsArr = [];

	connection.query("SELECT * FROM recipe_name WHERE recipe_name = 'Taco Salad'", function(err, rows){
		if(err){
			console.log("== Error fectching recipes from DB: ", err);
			res.status(500).send("Error fetching recipes: " + err);
		} else{
			//console.log("== raw rows: ", rows);
			
			rows.forEach(function(row){
				recipeMain.push({
					recipe_name:row.recipe_name,
					recipe_category: row.recipe_category,
					prep_time: row.prep_time,
					cook_time: row.cook_time,
					temp: row.temp,
					yield: row.yeild
				});
			});

			
			rows.forEach(function(row){
				recipeIDs.push({
					recipe_id: row.recipe_id
				});
			});
			
			// Get single variable recipe id 
			var refID = recipeIDs[0].recipe_id;
			//console.log("== refID: ", refID);

			// Create dynamic query with variable
			var equipmentQuery = "SELECT * FROM equipment WHERE recipe_id = " + connection.escape(refID);
			//console.log("== dynamicQuery: ", dynamicQuery);

			// Grab equipment data from DB
			connection.query(equipmentQuery, function(err, rows){
				if(err){
					console.log("== Error fectching equipment from DB: ", err);
					res.status(500).send("Error fetching equipment: " + err);
				} else{
					//console.log("== raw rows: ", rows);
					rows.forEach(function(row){
						equipment.push({
							equipment_piece: row.equipment
						});
					});
				
			//console.log("== equipment: ", equipment);
			
			var ingredientQuery = "SELECT * FROM ingredients WHERE recipe_id = " + connection.escape(refID);

			// Grab ingredients data from DB
			connection.query(ingredientQuery, function(err, rows){
				if(err){
					console.log("== Error fectching ingredients from DB: ", err);
					res.status(500).send("Error fetching ingredients: " + err);
				} else{
					//console.log("== raw rows: ", rows);
					rows.forEach(function(row){
						ingredients.push({
							ingredient_value: row.ingredient_value
						});
					});
				
			//console.log("== ingredient: ", ingredients);
		

			var stepsQuery = "SELECT * FROM steps WHERE recipe_id = " + connection.escape(refID);

			// Grab steps data from DB
			connection.query(stepsQuery, function(err, rows){
				if(err){
					console.log("== Error fectching steps from DB: ", err);
					res.status(500).send("Error fetching steps: " + err);
				} else{
					//console.log("== raw steps: ", rows);
					rows.forEach(function(row){
						stepsArr.push({
							step_value: row.steps
						});
					});
				
			//console.log("== steps: ", steps);
			

			console.log("== final recipeMain: ", recipeMain);
			console.log("== final equipment: ", equipment);
			console.log("== final ingredients: ", ingredients);
			console.log("== final steps: ", stepsArr);
			
			
			res.render('index-page',{
				title: "MySQL Results",
				recipeMain: recipeMain,
				equipment: equipment,
				ingredients: ingredients,
				steps: stepsArr
			});
		}});
		}});
		}});
		}
	});
});

// Sever static files on request
app.get('/style.css', function(req, res){
	res.render('style.css');
});

app.get('/index.js', function(req, res){
	res.render('index.js');
});

// Catch all for 404
app.get('*', function (req, res) {
  res.render('404-page', {
  	title: "Error Page"
  });
});

/*
 * Make a connection to our MySQL database.  This connection will persist for
 * as long as our server is running.  Start the server listening on the
 * specified port if we succeeded in opening the connection.
 */
connection.connect(function(err) {
  if (err) {
    console.log("== Unable to make connection to MySQL Database.")
    throw err;
  }
});

app.listen(port, function () {
  console.log("== Listening on port", port);
});
