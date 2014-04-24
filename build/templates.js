angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("filepicker.html","<div class=\"filepicker jumbotron\">\n  <h1>Step 1: Upload Your Shit</h1>\n  <button class=\"btn btn-primary btn-lg\" ng-click=\"pick()\">File Picker</button>\n</div>");
$templateCache.put("player.html","<video\n  id=\"player\"\n  class=\"player video-js vjs-default-skin\"\n  controls\n  preload=\"auto\"\n  poster=\"\"\n  width=\"960\"\n  height=\"540\"\n  data-setup=\'{\"techOrder\": [\"html5\"]}\'>\n</video>");
$templateCache.put("upload.html","<div class=\"row\">\n  <div class=\"col-md-3\">\n\n    <h3>Select files</h3>\n\n    <div ng-show=\"uploader.isHTML5\">\n      <!-- 3. ng-file-over | ng-file-over=\"className\" -->\n      <div class=\"well my-drop-zone\" ng-file-over>\n        Base drop zone\n      </div>\n\n      <!-- Example: ng-file-drop | ng-file-drop=\"options\" -->\n      <div class=\"well my-drop-zone\" ng-file-drop=\"{ url: \'/foo\' }\" ng-file-over=\"another-file-over-class\">\n        Another drop zone with its own settings\n      </div>\n    </div>\n\n    <!-- 2. ng-file-select | ng-file-select=\"options\" -->\n    Multiple\n    <input ng-file-select type=\"file\" multiple  /><br/>\n\n    Single\n    <input ng-file-select type=\"file\" />\n  </div>\n\n  <div class=\"col-md-9\" style=\"margin-bottom: 40px\">\n\n    <h3>Upload queue</h3>\n    <p>Queue length: {{ uploader.queue.length }}</p>\n\n    <table class=\"table\">\n      <thead>\n      <tr>\n        <th width=\"50%\">Name</th>\n        <th ng-show=\"uploader.isHTML5\">Size</th>\n        <th ng-show=\"uploader.isHTML5\">Progress</th>\n        <th>Status</th>\n        <th>Actions</th>\n      </tr>\n      </thead>\n      <tbody>\n      <tr ng-repeat=\"item in uploader.queue\">\n        <td><strong>{{ item.file.name }}</strong></td>\n        <td ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n        <td ng-show=\"uploader.isHTML5\">\n          <div class=\"progress\" style=\"margin-bottom: 0;\">\n            <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ \'width\': item.progress + \'%\' }\"></div>\n          </div>\n        </td>\n        <td class=\"text-center\">\n          <span ng-show=\"item.isSuccess\"><i class=\"glyphicon glyphicon-ok\"></i></span>\n          <span ng-show=\"item.isCancel\"><i class=\"glyphicon glyphicon-ban-circle\"></i></span>\n          <span ng-show=\"item.isError\"><i class=\"glyphicon glyphicon-remove\"></i></span>\n        </td>\n        <td nowrap>\n          <button type=\"button\" class=\"btn btn-success btn-xs\" ng-click=\"item.upload()\" ng-disabled=\"item.isReady || item.isUploading || item.isSuccess\">\n            <span class=\"glyphicon glyphicon-upload\"></span> Upload\n          </button>\n          <button type=\"button\" class=\"btn btn-warning btn-xs\" ng-click=\"item.cancel()\" ng-disabled=\"!item.isUploading\">\n            <span class=\"glyphicon glyphicon-ban-circle\"></span> Cancel\n          </button>\n          <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-click=\"item.remove()\">\n            <span class=\"glyphicon glyphicon-trash\"></span> Remove\n          </button>\n        </td>\n      </tr>\n      </tbody>\n    </table>\n\n    <div>\n      <p>\n        Queue progress:\n      <div class=\"progress\" style=\"\">\n        <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ \'width\': uploader.progress + \'%\' }\"></div>\n      </div>\n      </p>\n      <button type=\"button\" class=\"btn btn-success btn-s\" ng-click=\"uploader.uploadAll()\" ng-disabled=\"!uploader.getNotUploadedItems().length\">\n        <span class=\"glyphicon glyphicon-upload\"></span> Upload all\n      </button>\n      <button type=\"button\" class=\"btn btn-warning btn-s\" ng-click=\"uploader.cancelAll()\" ng-disabled=\"!uploader.isUploading\">\n        <span class=\"glyphicon glyphicon-ban-circle\"></span> Cancel all\n      </button>\n      <button type=\"button\" class=\"btn btn-danger btn-s\" ng-click=\"uploader.clearQueue()\" ng-disabled=\"!uploader.queue.length\">\n        <span class=\"glyphicon glyphicon-trash\"></span> Remove all\n      </button>\n    </div>\n\n  </div>\n\n</div>");}]);