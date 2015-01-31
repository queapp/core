app = angular.module "QueGui"
app.controller "newWizardController", ($scope, $http, loginService) ->
  root = this
  @page = 0
  @pageNumber = 4
  @info =
    superAdminPassword: ""
    userMadeUsername: ""
    userMadePassword: ""

  @nextPage = ->

    # go to the next page
    @page++

    # on last page?

    # save everything
    @saveAllToBackend()  if @page + 1 >= @pageNumber + 1
    return

  @prevPage = ->
    @page--
    return

  @pageis = (page) ->
    page is @page


  # can the user move on to the next page?
  # used for the next button
  @canGoToNextPage = ->
    switch @page
      when 0
        return true
      when 1
        return @info.superAdminPassword.length > 5
      when 2
        return @info.userMadeUsername.length > 3 and @info.userMadeUsername.indexOf(" ") is -1 and @info.userMadePassword.length > 5
      when 3
        return true
    return


  # save both users to the backend
  @saveAllToBackend = ->

    # add superadmin user to backend
    $http(
      method: "post"
      url: host + "/users/addsuperuser"
      data: JSON.stringify(pass: @info.superAdminPassword)
    ).success (data) ->

      # now, lets login
      loginService.login "superadmin", root.info.superAdminPassword, ->

        # add user created user to backend
        $http
          method: "post"
          url: host + "/users/add"
          data: JSON.stringify(
            username: root.info.userMadeUsername
            pass: root.info.userMadePassword
            permissions: [
              "thing.*"
              "block.*"
              "notify.*"
              "token.*"
            ]
          )

        console.log "Added both users."

        # no longer a new instance!
        loginService.newInstance = false

        # now, lets logout
        # and let the user log back in
        loginService.logout()
        return

      return

    return

  return
