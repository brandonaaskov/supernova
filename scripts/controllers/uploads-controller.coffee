angular.module('fullscreen.tv').controller 'uploadsController', ($scope, firebase) ->
  $scope.userUploads = []
  $scope.gridOptions =
    data: 'userUploads'
    columnDefs: [
      field: 'displayName'
      displayName: 'Name'
    ,
      field: 'filename'
      displayName: 'Filename'
    ,
      field: 'job'
      displayName: 'Zencoder Job'
    ,
      field: 'size'
      displayName: 'Size'
    ]

  $scope.userUploads = firebase.userUploads