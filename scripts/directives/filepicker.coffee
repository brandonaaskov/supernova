angular.module('fullscreen.tv').directive 'filepicker', ($window, firebase, analytics, zencoder) ->
  restrict: 'A'
  link: (scope) ->
    scope.filepicker = $window.filepicker
    scope.filepicker.setKey 'AiCDu1zCuQQysPoX9Mb9bz'

  controller: ($scope) ->
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

    saveUploads = (inkBlob) ->
      _(inkBlob).each (file) ->
        filename = _.getFilename(file.key)
        file.displayName = filename # add a display name property to the object
        firebase.userUploads[filename] = file # add the file to the user's uploads
        firebase.userUploads.$save(filename)

    startJobs = (inkBlob) ->
      keys = _(inkBlob).pluck 'key'
      _(keys).each (filepath) ->
        filename = _.getFilename(filepath)
        console.log 'filename', filename
        zencoder.createJob(filepath).then (response) ->
          firebase.userUploads
            .$child(filename)
            .$update({job: response.data.id})
          firebase.userEncodes
            .$child(filename)
            .$update({jobId: response.data.id, files: response.data.outputs})

    $scope.pick = ->
      $scope.filepicker.pickAndStore options.picker, options.store, success, error