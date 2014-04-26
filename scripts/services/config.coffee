angular.module('fullscreen.tv').constant 'config',
  env: 'development'
  zencoder:
    integration: ''
    read: ''
    full: ''
  firebase:
    default: 'https://supernova.firebaseio.com/'
    uploads: 'https://supernova.firebaseio.com/uploads'
    encodes: 'https://supernova.firebaseio.com/encodes'
    clock: 'https://supernova.firebaseio.com/.info/serverTimeOffset'