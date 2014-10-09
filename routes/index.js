// create all of the routes for the application
module.exports = function(app, passport) {

  // root route (haha that sounds funny)
  app.get("/", function(req, res, next) {
    res.send("<h1>Que Backend</h1>If you're here, this most likely isn't what you want. This is a backend API; for the fontend interface start a web server in public/");
  });

  // thing routes
  require("./things")(app);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
