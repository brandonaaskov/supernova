angular.module 'fs.watch', [
  'ngCookies'
  'templates'
  'angularFileUpload'
  'segmentio'
]
.run (segmentio, $rootScope) ->
  $rootScope.$on '$stateChangeSuccess', segmentio.page()
  segmentio.load '2kucux9fa2'