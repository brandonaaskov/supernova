angular.module('fullscreen.tv', ['ngCookies', 'templates', 'angularFileUpload', 'segmentio']).run(function(segmentio, $rootScope) {
  $rootScope.$on('$stateChangeSuccess', segmentio.page());
  return segmentio.load('2kucux9fa2');
});

angular.module('fullscreen.tv').directive('upload', function($fileUploader, $location) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'upload.html',
    link: function(scope) {
      var uploader;
      uploader = $fileUploader.create({
        url: "/videos",
        alias: 'video[file]',
        autoUpload: true
      });
      uploader.bind('completeall', function() {
        uploader.clearQueue();
        return $location.path('/uploads/manager');
      });
      return scope.uploader = uploader;
    }
  };
});

angular.module('fullscreen.tv').directive('uploadsManager', function($http, $timeout, $location, firebase, zencoder) {
  return {
    restrict: 'E',
    templateUrl: '../views/uploads_manager.html',
    link: function(scope) {
      var getUploadsForState, updateAllInWork, updateUploads;
      scope.uploads = firebase.getUploads();
      scope.uploads.$on('loaded', function() {
        return updateAllInWork();
      });
      getUploadsForState = function(collection, state) {
        var uploads;
        uploads = _.filter(collection, function(upload) {
          return (upload != null ? upload.state : void 0) === state;
        });
        return uploads;
      };
      updateUploads = function(uploads) {
        return _.each(uploads, function(upload) {
          return zencoder.getJobProgress(upload.id, upload.job_id);
        });
      };
      updateAllInWork = function(timeoutInterval) {
        var encoding, processing, videos, waiting;
        if (timeoutInterval == null) {
          timeoutInterval = 5000;
        }
        encoding = updateUploads(getUploadsForState(scope.uploads, 'encoding'));
        processing = updateUploads(getUploadsForState(scope.uploads, 'processing'));
        waiting = updateUploads(getUploadsForState(scope.uploads, 'waiting'));
        videos = _.union(encoding, processing, waiting);
        if (!_.isEmpty(videos)) {
          $timeout(function() {
            return videos = updateAllInWork();
          }, timeoutInterval);
        }
        return videos;
      };
      return scope.updateAllInWork = updateAllInWork;
    },
    controller: function($scope) {
      $scope.kickOffJob = function(videoId) {
        return $http.post("videos/" + videoId + "/publish").then(function(response) {
          return $scope.updateAllInWork();
        });
      };
      $scope.removeUpload = function(id) {
        return $http["delete"]("videos/" + id);
      };
      return $scope.watch = function(id, state) {
        if (state !== 'finished') {
          return;
        }
        return $location.path("/watch/" + id);
      };
    }
  };
});

angular.module('fullscreen.tv').directive('filepicker', function($window) {
  return {
    restrict: 'E',
    templateUrl: 'filepicker.html',
    link: function(scope, element, attrs) {
      scope.filepicker = $window.filepicker;
      return scope.filepicker.setKey('AiCDu1zCuQQysPoX9Mb9bz');
    },
    controller: function($scope) {
      var picker;
      picker = {
        options: {
          container: 'window',
          services: ['COMPUTER', 'DROPBOX', 'BOX', 'GOOGLE_DRIVE', 'VIDEO', 'WEBCAM']
        },
        success: function(inkBlob) {
          return console.log('picker.success', inkBlob);
        },
        error: function(error) {
          return console.log('picker.error', error);
        }
      };
      return $scope.pick = function(options) {
        if (options == null) {
          options = {};
        }
        options = angular.extend(picker.options, options);
        return $scope.filepicker.pick(options, picker.success, picker.error);
      };
    }
  };
});

angular.module('fullscreen.tv').directive('player', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'player.html',
    scope: {
      video: '=',
      playlist: '='
    },
    link: function(scope) {
      return videojs('player').ready(function() {
        if (!!scope.player) {
          return;
        }
        scope.player = this;
        return this.on('ended', function() {
          var nextVideo;
          nextVideo = _.at(scope.playlist, scope.video.id);
          return console.log('nextvideo', nextVideo);
        });
      });
    },
    controller: function($scope) {
      $scope.$watch('playlist', function(playlist) {
        var _ref;
        console.log('playlist', playlist);
        return $scope.video = getPlaybackVideo(playlist[(_ref = $scope.video) != null ? _ref.id : void 0]);
      });
      return $scope.$watch('video', function(video) {
        if (!video) {
          return $scope.video = getPlaybackVideo($scope != null ? $scope.playlist[video != null ? video.id : void 0] : void 0);
        }
      });
    }
  };
});

angular.module('fullscreen.tv').directive('upload', function($fileUploader, $location) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'upload.html',
    link: function(scope) {
      var uploader;
      uploader = $fileUploader.create({
        url: "/videos",
        alias: 'video[file]',
        autoUpload: true
      });
      uploader.bind('completeall', function() {
        uploader.clearQueue();
        return $location.path('/uploads/manager');
      });
      return scope.uploader = uploader;
    }
  };
});

angular.module('fullscreen.tv').constant('config', {
  env: 'development',
  zencoder: {
    integration: '',
    read: '',
    full: ''
  },
  firebase: {
    "default": 'https://supernova.firebaseio.com/',
    uploads: 'https://supernova.firebaseio.com/uploads',
    clock: 'https://supernova.firebaseio.com/.info/serverTimeOffset'
  }
});

angular.module('fullscreen.tv').run(function($cookies) {
  var guid, s4;
  s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  guid = function() {
    return "" + (s4()) + (s4()) + "-" + (s4()) + "-" + (s4()) + "-" + (s4()) + "-" + (s4()) + (s4()) + (s4());
  };
  if (!$cookies.guid) {
    return $cookies.guid = guid();
  }
}).service('firebase', function($firebase, $cookies, config, $rootScope, $q) {
  var clock, getServerTime, publicAPI;
  clock = new Firebase(config.firebase.clock);
  getServerTime = function() {
    var deferred;
    deferred = $q.defer();
    clock.on('value', function(snap) {
      var offset;
      offset = Date.now() + snap.val();
      return deferred.resolve(offset);
    });
    return deferred.promise;
  };
  return publicAPI = {
    users: $firebase(new Firebase(config.firebase.users)),
    getServerTime: getServerTime
  };
});

angular.module('fullscreen.tv').service('liveSync', function(firebase, $window) {
  var AudioContext, publicApi, sync;
  navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  AudioContext = $window.AudioContext || $window.webkitAudioContext;
  sync = function(startTime, now, videoLength) {
    var constraints, jumpTo, success;
    jumpTo = (now - startTime) % videoLength;
    console.log('jumpTo (in seconds)', jumpTo / 1000);
    console.log('jumpTo (in minutes)', jumpTo / 1000 / 60);
    constraints = {
      video: false,
      audio: true
    };
    success = function(stream) {
      var context, filter, microphone;
      context = new AudioContext();
      microphone = context.createMediaStreamSource(stream);
      filter = context.createBiquadFilter();
      microphone.connect(filter);
      return filter.connect(context.destination);
    };
    return navigator.getMedia(constraints, success);
  };
  firebase.getServerTime().then(function(offset) {
    var fakeVideoLength, noonToday;
    noonToday = 1395687600000;
    fakeVideoLength = 22 * 60 * 1000;
    return sync(noonToday, offset, fakeVideoLength);
  });
  return publicApi = {
    sync: sync
  };
});

angular.module('fullscreen.tv').service('zencoder', function($http) {
  return {
    getJobProgress: function(id, jobId) {
      return $http.post("videos/" + id + "/" + jobId + "/progress").then(function(response) {
        return response.data;
      });
    }
  };
}).config(function($httpProvider) {
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  return $httpProvider.defaults.headers.post['Zencoder-Api-Key'] = '';
});
