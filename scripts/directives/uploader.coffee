angular.module('fs.watch').directive 'uploader', ->
  restrict: 'E'
  templateUrl: 'upload.html'
  link: (scope) ->
    console.log 'upload linked', scope