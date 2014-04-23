angular.module('upload', ['templates', 'angularFileUpload', 'pubnub.angular.service']).directive('uploader', function($fileUploader, PubNub) {
  return {
    restrict: 'E',
    templateUrl: 'upload.html',
    link: function(scope) {
      return console.log('PubNub', PubNub);
    }
  };
});
