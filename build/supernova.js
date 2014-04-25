angular.module('fullscreen.tv', ['ngCookies', 'templates', 'firebase']).run(function($cookies, analytics) {
  var guid, s4;
  s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  guid = function() {
    return "" + (s4()) + (s4()) + "-" + (s4()) + "-" + (s4()) + "-" + (s4()) + "-" + (s4()) + (s4()) + (s4());
  };
  if (!$cookies.guid) {
    $cookies.guid = guid();
  }
  return analytics.identify($cookies.guid);
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

angular.module('fullscreen.tv').controller('uploadsController', function($scope, firebase) {
  return $scope.userUploads = firebase.userUploads;
});

angular.module('fullscreen.tv').directive('filepicker', function($window, firebase, analytics, zencoder) {
  return {
    restrict: 'A',
    link: function(scope) {
      scope.filepicker = $window.filepicker;
      return scope.filepicker.setKey('AiCDu1zCuQQysPoX9Mb9bz');
    },
    controller: function($scope) {
      var error, getFilename, options, saveUploads, startJobs, success, userUploads;
      userUploads = firebase.uploads.$child(firebase.guid);
      options = {
        picker: {
          services: ['COMPUTER', 'DROPBOX', 'BOX', 'GOOGLE_DRIVE'],
          container: 'window',
          multiple: true,
          mimetype: 'video/*'
        },
        store: {
          path: "uploads/" + firebase.guid + "/"
        }
      };
      success = function(inkBlob) {
        saveUploads(inkBlob);
        startJobs(inkBlob);
        return analytics.track('Upload: Success', inkBlob);
      };
      error = function(FPError) {
        return analytics.track('Upload: Error', FPError.toString());
      };
      getFilename = function(key, dropExtension) {
        var filename;
        if (dropExtension == null) {
          dropExtension = true;
        }
        filename = _.last(key.split("uploads/" + firebase.guid + "/"));
        if (!dropExtension) {
          return filename;
        }
        return _.first(filename.split('.'));
      };
      saveUploads = function(inkBlob) {
        return _(inkBlob).each(function(file) {
          var filename;
          filename = getFilename(file.key);
          userUploads[filename] = file;
          return userUploads.$save(filename);
        });
      };
      startJobs = function(inkBlob) {
        var keys;
        keys = _(inkBlob).pluck('key');
        return _(keys).each(function(filename) {
          return zencoder.createJob(filename).then(function(response) {
            return userUploads.$child(getFilename(filename)).$update({
              zencoder: response
            });
          });
        });
      };
      return $scope.pick = function() {
        return $scope.filepicker.pickAndStore(options.picker, options.store, success, error);
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

angular.module('fullscreen.tv').directive('talkNerdyToMe', function($window) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var accent, polyfill, utterance, _ref;
      switch (attrs != null ? (_ref = attrs.accent) != null ? _ref.toLowerCase() : void 0 : void 0) {
        case 'en-us':
          accent = 'en-US';
          break;
        case 'en-gb':
          accent = 'en-GB';
          break;
        case 'en-es':
          accent = 'en-ES';
          break;
        case 'fr-fr':
          accent = 'fr-FR';
          break;
        case 'it-it':
          accent = 'it-IT';
          break;
        case 'de-de':
          accent = 'de-DE';
          break;
        case 'ja-jp':
          accent = 'en-JP';
          break;
        case 'ko-kr':
          accent = 'ko-KR';
          break;
        case 'zh-cn':
          accent = 'zh-CN';
          break;
        default:
          accent = 'en-US';
      }
      polyfill = {
        synthesis: $window.speechSynthesis || $window.speechSynthesisPolyfill,
        utterance: $window.SpeechSynthesisUtterance || $window.SpeechSynthesisUtterancePolyfill
      };
      utterance = new polyfill.utterance();
      utterance.lang = accent;
      utterance.volume = 1.0;
      utterance.rate = 1.2;
      scope.speak = function(words) {
        utterance.text = words;
        return polyfill.synthesis.speak(utterance);
      };
      if (attrs.talkNerdyToMe) {
        return angular.element(element).bind('click', function() {
          return scope.speak(attrs.talkNerdyToMe);
        });
      }
    }
  };
});

var __slice = [].slice;

angular.module('fullscreen.tv').factory('analytics', function() {
  var methods;
  methods = {};
  ['page', 'pageview', 'track', 'identify'].forEach(function(method) {
    return methods[method] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return window.analytics[method].apply(window.analytics, args);
    };
  });
  return methods;
}).run(function(analytics, $rootScope) {
  return $rootScope.$on("$routeChangeSuccess", function() {
    return analytics.page();
  });
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

angular.module('fullscreen.tv').service('firebase', function($firebase, $cookies, config, $rootScope, $q) {
  var clock, getServerTime, guid, publicAPI;
  clock = new Firebase(config.firebase.clock);
  guid = $cookies.guid;
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
    uploads: $firebase(new Firebase(config.firebase.uploads)),
    userUploads: $firebase(new Firebase("" + config.firebase.uploads + "/" + guid)),
    getServerTime: getServerTime,
    guid: guid
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

angular.module('fullscreen.tv').service('zencoder', function($http, firebase) {
  var baseUrl, createJob, getJobProgress, getOutputs, guid, keys, publicApi;
  guid = firebase.guid;
  baseUrl = 'https://app.zencoder.com/api/v2';
  keys = {
    read: '92cdc58ec35e590acb0980f75ddfa32c',
    full: '380e390b6b8fd2d600c9035db7d13c29'
  };
  createJob = function(filename) {
    return $http.post("" + baseUrl + "/jobs", getOutputs(filename));
  };
  getJobProgress = function(jobId) {
    return $http.get("" + baseUrl + "/jobs/" + jobId + "/progress.json?api_key=" + keys.full);
  };
  getOutputs = function(filename) {
    return {
      input: "s3://uploads/" + guid + "/" + filename,
      outputs: [
        {
          label: "low",
          format: "mp4",
          video_bitrate: 200,
          decoder_bitrate_cap: 300,
          decoder_buffer_size: 1200,
          audio_sample_rate: 44100,
          height: "288",
          url: "s3://encodes/" + guid + "/" + filename,
          h264_reference_frames: 1,
          forced_keyframe_rate: "0.1",
          audio_bitrate: 56,
          decimate: 2,
          rrs: true
        }, {
          label: "high",
          format: "mp4",
          video_bitrate: 1000,
          decoder_bitrate_cap: 1500,
          decoder_buffer_size: 6000,
          audio_sample_rate: 44100,
          height: "432",
          url: "s3://encodes/" + guid + "/" + filename,
          h264_reference_frames: "auto",
          h264_profile: "main",
          forced_keyframe_rate: "0.1",
          audio_bitrate: 56,
          rrs: true
        }, {
          source: "low",
          segment_video_snapshots: "true",
          url: "s3://encodes/" + guid + "/" + filename,
          copy_audio: "true",
          skip_video: "true",
          label: "hls-audio-only",
          type: "segmented",
          format: "aac",
          rrs: true
        }, {
          source: "low",
          format: "ts",
          copy_audio: "true",
          copy_video: "true",
          url: "s3://encodes/" + guid + "/" + filename,
          label: "hls-low",
          type: "segmented",
          rrs: true
        }, {
          source: "high",
          format: "ts",
          copy_audio: "true",
          copy_video: "true",
          url: "s3://encodes/" + guid + "/" + filename,
          label: "hls-high",
          type: "segmented",
          rrs: true
        }, {
          streams: [
            {
              path: "hls-low/" + filename + "_hls-low.m3u8",
              bandwidth: 256
            }, {
              path: "hls-audio-only/" + filename + "_hls-audio-only.m3u8",
              bandwidth: 56
            }, {
              path: "hls-high/" + filename + "_hls-high.m3u8",
              bandwidth: 1056
            }
          ],
          type: "playlist",
          url: "s3://encodes/" + guid + "/" + filename
        }
      ]
    };
  };
  return publicApi = {
    createJob: createJob,
    getJobProgress: getJobProgress
  };
}).config(function($httpProvider) {
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  return $httpProvider.defaults.headers.post['Zencoder-Api-Key'] = '380e390b6b8fd2d600c9035db7d13c29';
});
