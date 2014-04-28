angular.module('fullscreen.tv', ['ngCookies', 'ngGrid', 'templates', 'firebase']).config(function() {
  var mixins;
  mixins = {
    getFilename: function(key, dropExtension) {
      var filename;
      if (dropExtension == null) {
        dropExtension = true;
      }
      filename = _.last(key.split('/'));
      if (!dropExtension) {
        return filename;
      }
      return _.first(filename.split('.'));
    }
  };
  return _.mixin(mixins);
}).run(function($cookies, analytics) {
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

angular.module('fullscreen.tv').controller('uploadsController', function($scope, firebase, $filter) {
  $scope.userUploads = [];
  $scope.gridOptions = {
    data: 'userUploads',
    columnDefs: [
      {
        field: 'displayName',
        displayName: 'Name'
      }, {
        field: 'filename',
        displayName: 'Filename'
      }, {
        field: 'job',
        displayName: 'Zencoder Job'
      }, {
        field: 'size',
        displayName: 'Size'
      }
    ]
  };
  firebase.userUploads.$on('loaded', function(data) {
    $filter('orderByPriority')(data);
    $scope.userUploads = _(data).toArray();
    console.log('$scope.userUploads', $scope.userUploads);
    return $scope.$digest();
  });
  console.log('userUploads (firebase)', firebase.userUploads);
  return console.log('userUploads', $scope.userUploads);
});

angular.module('fullscreen.tv').directive('contenteditable', function() {
  return {
    restrict: 'A',
    require: "ngModel",
    scope: {
      onBlur: '&'
    },
    link: function(scope, element, attrs, ngModel) {
      element.bind('keypress', (function(_this) {
        return function(event) {
          if (event.keyCode !== 13) {
            return;
          }
          event.preventDefault();
          return $(element).trigger('blur');
        };
      })(this));
      element.bind("blur", function() {
        return scope.$apply(function() {
          ngModel.$setViewValue(element.html());
          element.addClass('edited');
          return scope.onBlur();
        });
      });
      ngModel.$render = (function(_this) {
        return function() {
          return element.html(ngModel.$viewValue);
        };
      })(this);
      return ngModel.$render();
    }
  };
});

angular.module('fullscreen.tv').directive('filepicker', function($window, firebase, analytics, zencoder) {
  return {
    restrict: 'A',
    link: function(scope) {
      scope.filepicker = $window.filepicker;
      return scope.filepicker.setKey('AiCDu1zCuQQysPoX9Mb9bz');
    },
    controller: function($scope) {
      var error, options, saveUploads, startJobs, success;
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
      saveUploads = function(inkBlob) {
        return _(inkBlob).each(function(file) {
          var filename;
          filename = _.getFilename(file.key);
          file.displayName = filename;
          firebase.userUploads[filename] = file;
          return firebase.userUploads.$save(filename);
        });
      };
      startJobs = function(inkBlob) {
        var keys;
        keys = _(inkBlob).pluck('key');
        return _(keys).each(function(filepath) {
          var filename;
          filename = _.getFilename(filepath);
          console.log('filename', filename);
          return zencoder.createJob(filepath).then(function(response) {
            firebase.userUploads.$child(filename).$update({
              job: response.data.id
            });
            return firebase.userEncodes.$child(filename).$update({
              jobId: response.data.id,
              files: response.data.outputs
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

angular.module('fullscreen.tv').directive('speechToggle', function($rootScope) {
  return {
    link: function(scope, element) {
      var toggle;
      scope.speechEnabled = true;
      scope.disableSpeech = function() {
        return $rootScope.$broadcast('ba-speech-disable');
      };
      scope.enableSpeech = function() {
        return $rootScope.$broadcast('ba-speech-enable');
      };
      $rootScope.$on('ba-speech-disable', function() {
        scope.speechEnabled = false;
        return scope.$digest();
      });
      $rootScope.$on('ba-speech-enable', function() {
        scope.speechEnabled = true;
        return scope.$digest();
      });
      toggle = function() {
        if (scope.speechEnabled) {
          return $rootScope.$broadcast('ba-speech-disable');
        } else {
          return $rootScope.$broadcast('ba-speech-enable');
        }
      };
      return element.bind('click', (function(_this) {
        return function() {
          return toggle();
        };
      })(this));
    }
  };
});

angular.module('fullscreen.tv').directive('speech', function($window, $rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var getVoice, speak, synthesis, synthesisUtterance, toggleSpeaking, utterance;
      if (!($window != null ? $window.speechSynthesis : void 0)) {
        return;
      }
      scope.enabled = true;
      element.addClass('ba-speech');
      synthesis = $window.speechSynthesis;
      synthesisUtterance = $window.SpeechSynthesisUtterance;
      utterance = new synthesisUtterance();
      toggleSpeaking = function(flag) {
        if (flag) {
          element.addClass('speaking');
        } else {
          element.removeClass('speaking');
        }
        scope.speaking = flag;
        return scope.$digest();
      };
      utterance.onstart = function() {
        return toggleSpeaking(true);
      };
      utterance.onend = function() {
        return toggleSpeaking(false);
      };
      utterance.onpause = function() {
        return toggleSpeaking(false);
      };
      utterance.onresume = function() {
        return toggleSpeaking(true);
      };
      synthesis.onvoiceschanged = (function(_this) {
        return function() {
          utterance.voice = getVoice(attrs != null ? attrs.language : void 0);
          if (attrs.debug) {
            console.log(utterance.voice);
          }
          utterance.voiceURI = utterance.voice.voiceURI;
          utterance.lang = utterance.voice.lang;
          utterance.volume = 1.0;
          utterance.rate = 1.2;
          return utterance.pitch = 1;
        };
      })(this);
      getVoice = function(language) {
        var override, systemDefault, voices;
        voices = synthesis.getVoices();
        systemDefault = _(voices).findWhere({
          "default": true
        });
        override = _(voices).findWhere({
          lang: language
        });
        if (override) {
          return override;
        } else {
          return systemDefault;
        }
      };
      speak = function(words) {
        if (!(words && scope.enabled)) {
          return;
        }
        utterance.text = words;
        return synthesis.speak(utterance);
      };
      angular.element(element).bind('click', function() {
        synthesis.cancel();
        return speak(attrs.speech);
      });
      $rootScope.$on('ba-speech-disable', function() {
        synthesis.cancel();
        return scope.enabled = false;
      });
      return $rootScope.$on('ba-speech-enable', function() {
        return scope.enabled = true;
      });
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
    encodes: 'https://supernova.firebaseio.com/encodes',
    clock: 'https://supernova.firebaseio.com/.info/serverTimeOffset'
  }
});

angular.module('fullscreen.tv').service('firebase', function($firebase, $cookies, config, $rootScope, $q) {
  var clock, encodes, getServerTime, guid, publicAPI, uploads, userEncodes, userUploads;
  clock = new Firebase(config.firebase.clock);
  guid = $cookies.guid;
  uploads = $firebase(new Firebase(config.firebase.uploads));
  userUploads = uploads.$child(guid);
  encodes = $firebase(new Firebase(config.firebase.encodes));
  userEncodes = encodes.$child(guid);
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
    userUploads: userUploads,
    userEncodes: userEncodes,
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
  createJob = function(filepath) {
    return $http.post("" + baseUrl + "/jobs", getOutputs(filepath));
  };
  getJobProgress = function(jobId) {
    return $http.get("" + baseUrl + "/jobs/" + jobId + "/progress.json?api_key=" + keys.full);
  };
  getOutputs = function(filepath) {
    var filename;
    filename = _.getFilename(filepath);
    baseUrl = "s3://fullscreen-tv";
    return {
      input: "" + baseUrl + "/" + filepath,
      outputs: [
        {
          label: "low",
          format: "mp4",
          video_bitrate: 200,
          decoder_bitrate_cap: 300,
          decoder_buffer_size: 1200,
          audio_sample_rate: 44100,
          height: "288",
          url: "" + baseUrl + "/encodes/" + guid + "/" + filename + "-low.mp4",
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
          url: "" + baseUrl + "/encodes/" + guid + "/" + filename + "-high.mp4",
          h264_reference_frames: "auto",
          h264_profile: "main",
          forced_keyframe_rate: "0.1",
          audio_bitrate: 56,
          rrs: true
        }, {
          source: "low",
          segment_video_snapshots: "true",
          url: "" + baseUrl + "/encodes/" + guid + "/" + filename + "-audio-only.m4a",
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
          url: "" + baseUrl + "/encodes/" + guid + "/" + filename + "-hls-low.mp4",
          label: "hls-low",
          type: "segmented",
          rrs: true
        }, {
          source: "high",
          format: "ts",
          copy_audio: "true",
          copy_video: "true",
          url: "" + baseUrl + "/encodes/" + guid + "/" + filename + "-hls-high.mp4",
          label: "hls-high",
          type: "segmented",
          rrs: true
        }, {
          streams: [
            {
              path: "hls-low/" + filename + "-hls-low.m3u8",
              bandwidth: 256
            }, {
              path: "hls-audio-only/" + filename + "-hls-audio-only.m3u8",
              bandwidth: 56
            }, {
              path: "hls-high/" + filename + "-hls-high.m3u8",
              bandwidth: 1056
            }
          ],
          type: "playlist",
          url: "" + baseUrl + "/encodes/" + guid + "/" + filename + ".m3u8"
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
