app.controller("newWizardController", function($scope, $html) {
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
    if (this.page+1 >= this.pageNumber) {
      // save everything
      this.saveAllToBackend();
    }
  };
  this.prevPage = function() { this.page--; };
  this.pageis = function(page) { return page === this.page };

  // can the user move on to the next page?
  // used for the next button
  this.canGoToNextPage = function() {
    console.log(this.page)
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

  this.saveAllToBackend = function() {

    // add superadmin user to backend
    $html({
      method: "get",
      url: host+"/users/add",
      body: JSON.stringify({
        username: "superadmin",
        pass: this.superAdminPassword
      })
    });

    // add user created user to backend
    $html({
      method: "get",
      url: host+"/users/add",
      body: JSON.stringify({
        username: this.info.userMadeUsername,
        pass: this.userMadePassword
      })
    });

    console.log("Added users.");

    // no longer a new instance!
    nC.user.newInstance = false;

  };

});