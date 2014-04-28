angular.module('fullscreen.tv').controller 'uploadsController', ($scope, firebase, $filter) ->
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

  firebase.userUploads.$on 'loaded', (data) ->
    $filter('orderByPriority')(data)
    $scope.userUploads = _(data).toArray()
    console.log '$scope.userUploads', $scope.userUploads
    $scope.$digest()

  console.log 'userUploads (firebase)', firebase.userUploads
  console.log 'userUploads', $scope.userUploads