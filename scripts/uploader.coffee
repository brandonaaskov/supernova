angular.module('upload', ['templates', 'angularFileUpload', 'pubnub.angular.service'])
.directive 'uploader', ($fileUploader, PubNub) ->
  restrict: 'E'
  templateUrl: 'upload.html'
  link: (scope) ->
#    PubNub.ngPublish({
#      channel: 'fs.watch.uploads',
#      message: 'test message'
#    });
#
#    PubNub.ngSubscribe
    console.log 'PubNub', PubNub