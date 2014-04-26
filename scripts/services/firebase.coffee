angular.module('fullscreen.tv').service 'firebase', ($firebase, $cookies, config, $rootScope, $q) ->
  clock = new Firebase config.firebase.clock
  guid = $cookies.guid

  uploads = $firebase new Firebase config.firebase.uploads
  userUploads = uploads.$child guid
  encodes = $firebase new Firebase config.firebase.encodes
  userEncodes = encodes.$child guid

  getServerTime = ->
    deferred = $q.defer()
    clock.on 'value', (snap) ->
      offset = Date.now() + snap.val()
      deferred.resolve offset
    return deferred.promise

  return publicAPI =
    uploads: $firebase new Firebase config.firebase.uploads
    userUploads: userUploads
    userEncodes: userEncodes
    getServerTime: getServerTime
    guid: guid