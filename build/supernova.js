angular.module('fs.watch', ['ngCookies', 'templates', 'angularFileUpload', 'segmentio']).run(function(segmentio, $rootScope) {
  $rootScope.$on('$stateChangeSuccess', segmentio.page());
  return segmentio.load('2kucux9fa2');
});

angular.module('fs.watch').directive('uploader', function() {
  return {
    restrict: 'E',
    templateUrl: 'upload.html',
    link: function(scope) {
      return console.log('upload linked', scope);
    }
  };
});

angular.module('fs.watch').run(function($cookies) {
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

angular.module('fs.watch').service('liveSync', function(firebase, $window) {
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

angular.module('fs.watch').service('zencoder', function($http) {
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
