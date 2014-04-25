angular.module('fullscreen.tv').service 'firebase', ($firebase, $cookies, config, $rootScope, $q) ->
  clock = new Firebase config.firebase.clock
  guid = $cookies.guid

  getServerTime = ->
    deferred = $q.defer()
    clock.on 'value', (snap) ->
      offset = Date.now() + snap.val()
      deferred.resolve(offset)
    return deferred.promise

  return publicAPI =
    uploads: $firebase new Firebase config.firebase.uploads
    userUploads: $firebase new Firebase "#{config.firebase.uploads}/#{guid}"
    getServerTime: getServerTime
    guid: guid