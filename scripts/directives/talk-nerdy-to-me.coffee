angular.module('fullscreen.tv').directive 'talkNerdyToMe', ($window) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    switch attrs?.accent?.toLowerCase()
      when 'en-us' then accent = 'en-US'
      when 'en-gb' then accent = 'en-GB'
      when 'en-es' then accent = 'en-ES'
      when 'fr-fr' then accent = 'fr-FR'
      when 'it-it' then accent = 'it-IT'
      when 'de-de' then accent = 'de-DE'
      when 'ja-jp' then accent = 'en-JP'
      when 'ko-kr' then accent = 'ko-KR'
      when 'zh-cn' then accent = 'zh-CN'
      else accent = 'en-US'

    polyfill =
      synthesis: $window.speechSynthesis or $window.speechSynthesisPolyfill
      utterance: $window.SpeechSynthesisUtterance or $window.SpeechSynthesisUtterancePolyfill

    utterance = new polyfill.utterance()
    utterance.lang = accent
    console.log 'accent', accent
    utterance.volume = 1.0
    utterance.rate = 1.2

    speak = (words) ->
      console.log 'speaking!'
      utterance.text = words
      polyfill.synthesis.speak utterance

    if attrs.talkNerdyToMe
      angular.element(element).bind 'click', ->
        _.throttle(speak, 1000)(attrs.talkNerdyToMe)