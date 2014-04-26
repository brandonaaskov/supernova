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
        file.displayName = filename # add a display name property to the object
        userUploads[filename] = file # add the file to the user's uploads
        userUploads.$save(filename)

    startJobs = (inkBlob) ->
      keys = _(inkBlob).pluck 'key'
      _(keys).each (filename) ->
        zencoder.createJob(filename).then (response) ->
          # add zencoder job details to the upload item in firebase
          userUploads.$child(getFilename(filename)).$update({zencoder: response})

    $scope.pick = ->
      $scope.filepicker.pickAndStore options.picker, options.store, success, error