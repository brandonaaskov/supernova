angular.module('fullscreen.tv').controller 'uploadsController', ($scope, firebase, $filter, auth) ->
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
    console.log 'test', firebase.userUploads
    $filter('orderByPriority')(data)
    $scope.userUploads = _(data).toArray()
#    console.log 'userUploads', $scope.userUploads
#    console.log '$scope.userUploads', $scope.userUploads
    $scope.$digest()