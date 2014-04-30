angular.module('fullscreen.tv', [
  'ngCookies'
  'templates'
  'firebase'
])
.config ->
  mixins =
    getFilename: (key, dropExtension = true) ->
      filename = _.last key.split('/')
      return filename unless dropExtension
      _.first filename.split('.')
  _.mixin mixins
.run ($cookies, analytics) ->
  # sets a unique guid so we can track users under one object (since they can login via many services)
  s4 = -> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  guid = -> "#{s4()}#{s4()}-#{s4()}-#{s4()}-#{s4()}-#{s4()}#{s4()}#{s4()}"
  unless $cookies.guid then $cookies.guid = guid()

  analytics.identify $cookies.guid

.run ($rootScope, auth) ->
  $rootScope.login = auth.login