angular.module('fullscreen.tv').service 'auth', ($firebase, $firebaseSimpleLogin, $cookies, config) ->
  auth = $firebaseSimpleLogin new Firebase(config.firebase.default)
  user =
    complete: $firebase new Firebase("#{config.firebase.users}/complete/#{$cookies.guid}")
    basic: $firebase new Firebase("#{config.firebase.users}/basic/#{$cookies.guid}")

  login = (service) ->
    switch service
      when 'facebook'
        console.log 'config', config.firebase.auth.facebook
        auth.$login('facebook', config.firebase.auth.facebook).then (providerDetails) ->
          updateUser(providerDetails)
      when 'github'
        auth.$login('github', config.firebase.auth.github).then (providerDetails) ->
          updateUser(providerDetails)
      when 'twitter'
        auth.$login('twitter', config.firebase.auth.twitter).then (providerDetails) ->
          updateUser(providerDetails)

  hasAccount = ->
    return false unless user
    return _.has(user.complete, 'github') or _.has(user.complete, 'facebook') or _.has(user.complete, 'twitter')

  updateUser = (providerDetails) ->
    updateComplete(providerDetails)
    updateBasic()

  updateComplete = (providerDetails) ->
    user.complete[providerDetails.provider] = providerDetails
    user.complete.$save()

  updateBasic = ->
    merged = _.chain({})
      .defaults(user.complete?.twitter)
      .defaults(user.complete?.facebook)
      .defaults(user.complete?.github)
      .value()

    user.basic.guid = $cookies.guid
    user.basic.name = merged?.displayName
    user.basic.email = merged?.email
    user.basic.imageUrl = merged?.avatar_url
    user.basic.location = if _.isString(merged?.location) then merged?.location else merged.location?.name
    user.basic.gender = merged?.gender
    user.basic.profileUrl = merged?.profileUrl
    user.basic.github = _.has(user.complete, 'github')
    user.basic.facebook = _.has(user.complete, 'facebook')
    user.basic.twitter = _.has(user.complete, 'twitter')
    user.basic.$save()

  return {
    login: login
    hasAccount: hasAccount
    user: user.basic
    getCurrentUser: -> auth.$getCurrentUser().then (user) -> return user
  }