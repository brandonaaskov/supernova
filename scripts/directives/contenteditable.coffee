angular.module('fullscreen.tv').directive 'contenteditable', ->
  restrict: 'A'
  require: "ngModel"
  scope:
    onBlur: '&'
  link: (scope, element, attrs, ngModel) ->
    original = ngModel.$viewValue
    # view -> model
    element.bind 'keypress', (event) =>
      return unless event.keyCode is 13 # enter key
      event.preventDefault()
      $(element).trigger 'blur'

    element.bind "blur", ->
      scope.$apply ->
        console.log 'test', [ngModel.$viewValue, original]
        return if ngModel.$viewValue isnt original
        ngModel.$setViewValue element.html()
        element.addClass 'changed'
        console.log 'blur', ngModel.$viewValue

    # model -> view
    ngModel.$render = =>
      element.html ngModel.$viewValue

    # load init value from DOM
    ngModel.$render()