angular.module('fullscreen.tv').directive 'contenteditable', ->
  restrict: 'A'
  require: "ngModel"
  scope:
    onBlur: '&'
  link: (scope, element, attrs, ngModel) ->
    element.bind 'keypress', (event) =>
      return unless event.keyCode is 13 # enter key
      event.preventDefault()
      $(element).trigger 'blur'

    element.bind "blur", ->
      scope.$apply ->
        ngModel.$setViewValue element.html() # view -> model
        element.addClass 'edited'
        scope.onBlur()

    # model -> view
    ngModel.$render = =>
      element.html ngModel.$viewValue

    # load init value from DOM
    ngModel.$render()