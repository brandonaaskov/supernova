angular.module('fullscreen.tv').directive 'speech', ($window) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    synthesis = $window?.speechSynthesis
    utterance = $window?.SpeechSynthesisUtterance

    return unless synthesis and utterance

    synthesis.onvoiceschanged = =>
      utterance = new utterance()
      voice = getVoice attrs?.lang
      utterance.lang = _(voice).pluck('lang')
      utterance.volume = 1.0 # between 0 and 1
      utterance.rate = 1.2 # between 0 and 10
      utterance.pitch = 1 # between 0 and 2 (default is 1)
      utterance.voiceURI = attrs?.voiceURI
      utterance.voice = voice

    getVoice = (language) ->
      voices = synthesis.getVoices()
      return _(voices).findWhere({default: true}) unless language


    console.log 'utterance', utterance

    speak = (words) ->
      utterance.text = words
      synthesis.speak utterance

    speak = _(speak).throttle(1000)

    if attrs.speech
      angular.element(element).bind 'click', -> speak attrs.speech