app.controller("newWizardController", function($scope) {
  this.page = 0;

  this.info = {
    superAdminPassword: "",

    userMadeUsername: "",
    userMadePassword: ""
  }

  this.nextPage = function() { this.page++; };
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
    };
  };

});