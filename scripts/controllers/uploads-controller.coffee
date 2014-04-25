angular.module('fullscreen.tv').controller 'uploadsController', ($scope, firebase) ->
  $scope.userUploads = firebase.userUploads