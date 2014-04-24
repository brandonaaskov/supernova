angular.module('fullscreen.tv').directive 'upload', ($fileUploader, $location) ->
  restrict: 'E'
  replace: true
  templateUrl: 'upload.html'
  link: (scope) ->
    uploader = $fileUploader.create
      url: "/videos"
      alias: 'video[file]'
      autoUpload: true

    uploader.bind 'completeall', ->
      uploader.clearQueue()
      $location.path('/uploads/manager')

    scope.uploader = uploader