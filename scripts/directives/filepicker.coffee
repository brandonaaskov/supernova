angular.module('fullscreen.tv').directive 'filepicker', ($window, firebase, analytics, zencoder) ->
  restrict: 'A'
  link: (scope) ->
    scope.filepicker = $window.filepicker
    scope.filepicker.setKey 'AiCDu1zCuQQysPoX9Mb9bz'

  controller: ($scope) ->
    userUploads = firebase.uploads.$child(firebase.guid)

    options =
      picker:
        services: [
          'COMPUTER'
          'DROPBOX'
          'BOX'
          'GOOGLE_DRIVE'
        ]
        container: 'window'
        multiple: true
        mimetype: 'video/*'
      store:
        path: "uploads/#{firebase.guid}/"

    success = (inkBlob) ->
      saveUploads inkBlob
      startJobs inkBlob
      analytics.track 'Upload: Success', inkBlob

    error = (FPError) ->
      analytics.track 'Upload: Error', FPError.toString()

    getFilename = (key, dropExtension = true) ->
      filename = _.last key.split("uploads/#{firebase.guid}/")
      return filename unless dropExtension
      _.first filename.split('.')

    saveUploads = (inkBlob) ->
      _(inkBlob).each (file) ->
        filename = getFilename(file.key)
        userUploads[filename] = file
        userUploads.$save(filename)

    startJobs = (inkBlob) ->
      keys = _(inkBlob).pluck 'key'
      _(keys).each (filename) ->
        zencoder.createJob(filename).then (response) ->
          userUploads.$child(getFilename(filename)).$update({zencoder: response})

    $scope.pick = ->
      $scope.filepicker.pickAndStore options.picker, options.store, success, error