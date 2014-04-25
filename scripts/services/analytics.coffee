# Create an analytics service to proxy calls through to segmentio
angular.module('fullscreen.tv').factory 'analytics', ->
  methods = {}
  ['page', 'pageview', 'track', 'identify'].forEach (method) ->
    methods[method] = (args...) ->
      window.analytics[method].apply(window.analytics, args)

  return methods

.run (analytics, $rootScope) ->
  # Track virtual pageviews
  $rootScope.$on "$routeChangeSuccess", -> analytics.page()