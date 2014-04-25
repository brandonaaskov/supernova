angular.module('fullscreen.tv').directive 'filepicker', ($window, firebase, segmentio) ->
  restrict: 'A'
  link: (scope) ->
    scope.filepicker = $window.filepicker
    scope.filepicker.setKey 'AiCDu1zCuQQysPoX9Mb9bz'

  controller: ($scope) ->
    options =
      picker:
        services: [
          'COMPUTER'
          'DROPBOX'
          'BOX'
          'GOOGLE_DRIVE'
        ]
        container: 'window'
        multiple: true
      store:
        path: 'uploads/'

    success = (inkBlob) ->
        firebase.uploads.$child(firebase.guid).$add(inkBlob)
        segmentio.track 'Upload: Success', inkBlob

    error = (FPError) ->
        segmentio.track 'Upload: Error', FPError.toString()

    $scope.pick = ->
      $scope.filepicker.pickAndStore options.picker, options.store, success, error