angular.module('upload', ['templates', 'angularFileUpload']).directive 'uploader', ($fileUploader) ->
  restrict: 'E'
  templateUrl: 'upload.html'
  link: (scope) ->
    console.log 'uploader linked'