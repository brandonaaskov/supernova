angular.module('fullscreen.tv').service 'firebase', ($firebase, $cookies, config, $rootScope, $q) ->
  clock = new Firebase config.firebase.clock

  getServerTime = ->
    deferred = $q.defer()
    clock.on 'value', (snap) ->
      offset = Date.now() + snap.val()
      deferred.resolve(offset)
    return deferred.promise

  return publicAPI =
    uploads: $firebase new Firebase config.firebase.uploads
    getServerTime: getServerTime
    guid: $cookies.guid