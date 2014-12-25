app.controller("newWizardController", function($scope, $http, loginService) {
  var root = this;

  this.page = 0;
  this.pageNumber = 4;

  this.info = {
    superAdminPassword: "",

    userMadeUsername: "",
    userMadePassword: ""
  }

  this.nextPage = function() { 
    // go to the next page
    this.page++; 

    // on last page?
    if (this.page+1 >= this.pageNumber+1) {
      // save everything
      this.saveAllToBackend();
    }
  };
  this.prevPage = function() { this.page--; };
  this.pageis = function(page) { return page === this.page };

  // can the user move on to the next page?
  // used for the next button
  this.canGoToNextPage = function() {
    switch(this.page) {
      case 0:
        return true;
        break;
      case 1:
        return this.info.superAdminPassword.length > 5;
        break;
      case 2:
        return this.info.userMadeUsername.length > 3 && 
          this.info.userMadeUsername.indexOf(' ') === -1 && 
          this.info.userMadePassword.length > 5;
        break;
      case 3:
        return true;
        break;
    };
  };

  // save both users to the backend
  this.saveAllToBackend = function() {

    // add superadmin user to backend
    $http({
      method: "post",
      url: host+"/users/addsuperuser",
      data: JSON.stringify({
        pass: this.info.superAdminPassword
      })
    }).success(function(data) {
      
      // now, lets login
      loginService.login("superadmin", root.info.superAdminPassword, function() {

        // add user created user to backend
        $http({
          method: "post",
          url: host+"/users/add",
          data: JSON.stringify({
            username: root.info.userMadeUsername,
            pass: root.info.userMadePassword
          })
        });

        console.log("Added both users.");

        // no longer a new instance!
        loginService.newInstance = false;

        // now, lets logout
        // and let the user log back in
        loginService.logout();
      });

    });


  };

});