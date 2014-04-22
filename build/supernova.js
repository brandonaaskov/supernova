angular.module('upload', ['templates', 'angularFileUpload']).directive('uploader', function($fileUploader) {
  return {
    restrict: 'E',
    templateUrl: 'upload.html',
    link: function(scope) {
      return console.log('uploader linked');
    }
  };
});
