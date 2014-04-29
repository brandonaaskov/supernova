angular.module('fullscreen.tv').directive 'speech', ($window, $rootScope) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    return unless $window?.speechSynthesis

    # setup
    scope.enabled = true
    element.addClass 'ba-speech'
    synthesis = $window.speechSynthesis
    synthesisUtterance = $window.SpeechSynthesisUtterance
    utterance = new synthesisUtterance()

    toggleSpeaking = (flag) ->
      if flag then element.addClass 'speaking' else element.removeClass 'speaking'
      scope.speaking = flag
      $rootScope.$broadcast 'ba-speech-speaking', { speaking: scope.speaking }
      scope.$digest()

    # listeners for the utterance so that we know when speaking is happening
    utterance.onstart = -> toggleSpeaking true
    utterance.onend = -> toggleSpeaking false
    utterance.onpause = -> toggleSpeaking false
    utterance.onresume = -> toggleSpeaking true

    # voices come down automatically, but async, so we have to wait...
    synthesis.onvoiceschanged = =>
      utterance.voice = getVoice attrs?.language
      if attrs.debug then console.log utterance.voice
      utterance.voiceURI = utterance.voice.voiceURI
      utterance.lang = utterance.voice.lang
      utterance.volume = 1.0 # between 0 and 1
      utterance.rate = 1.2 # between 0 and 10
      utterance.pitch = 1 # between 0 and 2 (default is 1)

    # finds a voice based on language provided (case matters)
    getVoice = (language) ->
      voices = synthesis.getVoices()
      systemDefault = _(voices).findWhere({default: true})
      override = _(voices).findWhere({lang: language})
      if override then return override else return systemDefault

    speak = (words) ->
      return unless words and scope.enabled
      utterance.text = words
      synthesis.speak utterance

    angular.element(element).bind 'click', ->
      # speaking just adds an utterance to the queue, so we'll cancel first to
      # make sure we don't queue up a bunch of utterances when some hammers on
      # their mouse
      synthesis.cancel()
      speak attrs.speech

    $rootScope.$on 'ba-speech-disable', ->
      synthesis.cancel()
      scope.enabled = false
    $rootScope.$on 'ba-speech-enable', ->
      scope.enabled = true