angular.module('fullscreen.tv').directive 'speechToggle', ($rootScope) ->
  link: (scope, element) ->
    scope.speechEnabled = true
    scope.disableSpeech = -> $rootScope.$broadcast 'ba-speech-disable'
    scope.enableSpeech = -> $rootScope.$broadcast 'ba-speech-enable'

    $rootScope.$on 'ba-speech-disable', ->
      scope.speechEnabled = false
      scope.$digest()
    $rootScope.$on 'ba-speech-enable', ->
      scope.speechEnabled = true
      scope.$digest()

    toggle = ->
      if scope.speechEnabled then $rootScope.$broadcast('ba-speech-disable')
      else $rootScope.$broadcast('ba-speech-enable')

    element.bind 'click', => toggle()