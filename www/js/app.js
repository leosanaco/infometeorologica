// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova','chart.js','starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
        window.StatusBar.overlaysWebView(false);
        window.StatusBar.styleHex('#FFFFFF');
    }



  });
})

.constant('ConfigConstants', {
  
  /*cameraUrl: 'http://localhost:8100/tiempo',
  radarUrl: 'http://localhost:8100/radar',*/
  meditionsUrl: 'http://clima.info.unlp.edu.ar/',
  mapsUrl: 'http://mapa.clima.info.unlp.edu.ar/',
  cameraUrl: 'http://camara.clima.info.unlp.edu.ar',
  radarUrl: 'http://radar.inta.gov.ar/',
  weatherId:"4ca3a2ee6b3f40a139c0c633415009d3",
  cityId:"3432043",
  weatherUrl:"http://api.openweathermap.org/data/2.5/"
  
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('info', {
    url: "/info",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller:'MainCtrl'
  })

  // Each tab has its own nav history stack:

  .state('info.mediciones', {
    url: '/mediciones',
    views: {
      'mediciones': {
        templateUrl: 'templates/mediciones.html',
        controller: 'MedicionesCtrl'
      }
    }
  })

  .state('info.pronostico', {
    url: '/pronostico',
    views: {
      'pronostico': {
        templateUrl: 'templates/pronostico.html',
        controller: 'PronosticoCtrl'
      }
    }
  })

  .state('info.capturas', {
      url: '/capturas',
      abstract: true,
      views: {
        'capturas': {
          templateUrl: 'templates/capturas.html',
          controller: 'CapturasCtrl'
        }
      }
    })

  .state('info.capturas.fotos', {
      url: '/fotos',
      views: {
        'fotos': {
          templateUrl: 'templates/fotos.html',
          controller: 'FotosCtrl'
        }
      }
    })

  .state('info.capturas.radares', {
      cache: false,
      url: '/radares',
      views: {
        'fotos': {
          templateUrl: 'templates/radares.html',
          controller: 'RadaresCtrl'
        }
      }
    })

  .state('info.estaciones', {
      url: '/estaciones',
      views: {
        'estaciones': {
          templateUrl: 'templates/estaciones.html',
          controller: 'EstacionesCtrl'
        }
      }
    })

  .state('info.informacion', {
    url: '/informacion',
    views: {
      'informacion': {
        templateUrl: 'templates/informacion.html',
        controller: 'InformacionCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/info/mediciones');

});
