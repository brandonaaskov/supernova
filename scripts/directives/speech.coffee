angular.module('fullscreen.tv').directive 'speech', ($window) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    return unless $window?.speechSynthesis
    element.addClass 'ba-speech'
    synthesis = $window.speechSynthesis
    synthesisUtterance = $window.SpeechSynthesisUtterance
    utterance = new synthesisUtterance()

    toggleSpeaking = (flag) ->
      scope.speaking = flag
      scope.$digest()

    utterance.onstart = -> toggleSpeaking true
    utterance.onend = -> toggleSpeaking false
    utterance.onpause = -> toggleSpeaking false
    utterance.onresume = -> toggleSpeaking true

    synthesis.onvoiceschanged = =>
      utterance.voice = getVoice attrs?.language
      if attrs.debug then console.log utterance.voice
      utterance.voiceURI = utterance.voice.voiceURI
      utterance.lang = utterance.voice.lang
      utterance.volume = 1.0 # between 0 and 1
      utterance.rate = 1.2 # between 0 and 10
      utterance.pitch = 1 # between 0 and 2 (default is 1)

    getVoice = (language) ->
      voices = synthesis.getVoices()
      systemDefault = _(voices).findWhere({default: true})
      override = _(voices).findWhere({lang: language})
      if override
        return override
      else
        return systemDefault

    speak = (words) ->
      return unless words
      utterance.text = words
      synthesis.speak utterance

    angular.element(element).bind 'click', ->
      # speaking just adds an utterance to the queue, so we'll cancel first to
      # make sure we don't queue up a bunch of utterances when some hammers on
      # their mouse
      synthesis.cancel()
      speak attrs.speech