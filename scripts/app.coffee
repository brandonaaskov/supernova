angular.module 'fullscreen.tv', [
  'ngCookies'
  'templates'
  'segmentio'
  'firebase'
]
.run (segmentio, $rootScope) ->
  $rootScope.$on '$stateChangeSuccess', segmentio.page()
  segmentio.load '2kucux9fa2'