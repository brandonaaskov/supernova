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
    users: 'https://supernova.firebaseio.com/users'
    clock: 'https://supernova.firebaseio.com/.info/serverTimeOffset'
    auth:
      facebook:
        scope: 'user_birthday,friends_birthday' # asking for much more is a terrible idea (unless you really need it)
        rememberMe: true
      github:
        scope: 'user:email'
        rememberMe: true
      twitter:
        rememberMe: true