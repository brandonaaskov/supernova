angular.module('fullscreen.tv').directive 'filepicker', ($window) ->
  restrict: 'E'
  templateUrl: 'filepicker.html'
  link: (scope, element, attrs) ->
    scope.filepicker = $window.filepicker
    scope.filepicker.setKey 'AiCDu1zCuQQysPoX9Mb9bz'

  controller: ($scope) ->
    picker =
      options:
#        mimetypes: [
#          'image/*'
#          'text/plain'
#        ]
        container: 'window'
        services: [
          'COMPUTER'
          'DROPBOX'
          'BOX'
          'GOOGLE_DRIVE'
          'VIDEO'
          'WEBCAM'
        ]
      success: (inkBlob) ->
        console.log 'picker.success', inkBlob
        # todo store inkBlob in firebase
      error: (error) -> console.log 'picker.error', error

    $scope.pick = (options = {}) ->
      options = angular.extend picker.options, options
      $scope.filepicker.pick options, picker.success, picker.error