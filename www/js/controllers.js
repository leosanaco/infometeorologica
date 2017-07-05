angular.module('starter.controllers', [])

.controller('MainCtrl',function($scope, $cordovaNetwork) {

  var loadConfig = function(prop,def){
      var val = def;
      if(window.localStorage[prop]){
       val =window.localStorage[prop];
       console.log("Cambio de propiedad", prop + " " + val + " desde localStorage");    
      }

      if(val == "true"){
        val = true
      }

      if(val == "false"){
        val = false
      }

      if(parseInt(val)){
        val = parseInt(val);
      }

      return val;
  }

  $scope.wifiNetwork=false;
  //Mediciones config
  $scope.actualizacion=loadConfig("actualizacion",true);

  $scope.mobile = (window.cordova != null);

  //Capturas config
  $scope.verControles=loadConfig("verControles",true);
  $scope.verHora=loadConfig("verHora",true);
  $scope.verDesplazadora=loadConfig("verDesplazadora",true);
  $scope.velocidad=loadConfig("velocidad",2);
  $scope.frecuencia=loadConfig("frecuencia",2);

  document.addEventListener("deviceready", function () {

    var type = $cordovaNetwork.getNetwork()
    var isOnline = $cordovaNetwork.isOnline()
    var isOffline = $cordovaNetwork.isOffline()

    $scope.wifiNetwork = (type == "wifi");

  }, false);

  $scope.update = function(prop,elem){
    $scope[prop] = elem[prop];
    window.localStorage[prop] = $scope[prop];
    console.log("Cambio de propiedad", prop + " " + $scope[prop]);    
  }

})

.controller('MedicionesCtrl', function($scope, Meditions) {

  $scope.measures = {
      "temperature":{
        viewChart:false,
        color:"#C0392B",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:"º"
      },
      "humidity":{
        viewChart:false,
        color:"#27AE60",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:"%"
      },
      "bar":{
        viewChart:false,
        color:"#F1C40F",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:"hPa"
      },
      "wind_speed":{
        viewChart:false,
        color:"#3498DB",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:"km/h"
      },
      "wind_direction":{
        viewChart:false,
        color:"#9B59B6",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:""
      },
      "wind_chill":{
        viewChart:false,
        color:"#035287",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:"º"
      },
      "uv":{
        viewChart:false,
        color:"#927500",
        chartData:[],
        chartLabels:[],
        options:{},
        symbol:""
      },
    }

  Meditions.all().then(function(resp){
  	$scope.medition = resp.data;

    Chart.defaults.global.animation= false;

    Meditions.history().then(function(){

      /*for(m in $scope.measures){
        var measure = m;
        console.log(measure,$scope.measures[measure]);
        var currentMeasure = $scope.measures[measure];

        Meditions.history(measure).then(function(resp){

          var unit = resp.unit;

          $scope.measures[unit].options = {
            scaleLabel : "<%= value %>"+$scope.measures[unit].symbol
          }

          Chart.defaults.global.multiTooltipTemplate= "<%= value + ' %' %>",
          Chart.defaults.global.colours[0]=$scope.measures[unit].color;
          Chart.defaults.global.tooltipTemplate= "<%= value %>" + $scope.measures[unit].symbol;

          $scope.measures[unit].chartLabels = resp.dates;
          $scope.measures[unit].chartData = [resp.values];

        });

      }*/

  });

  });

  $scope.toggleChart = function(unit,event){

    if(event.target.tagName == "CANVAS"){
      return false;
    }

    $scope.measures[unit].viewChart = !$scope.measures[unit].viewChart

    var currentMeasure = $scope.measures[measure];
      var measure = unit;
      Meditions.history(measure).then(function(resp){

        var unit = resp.unit;

        $scope.measures[unit].options = {
          scaleLabel : "<%= value %>"+$scope.measures[unit].symbol
        }

        Chart.defaults.global.multiTooltipTemplate= "<%= value + ' %' %>",
        Chart.defaults.global.colours[0]=$scope.measures[unit].color;
        Chart.defaults.global.tooltipTemplate= "<%= value %>" + $scope.measures[unit].symbol;

        $scope.measures[unit].chartLabels = resp.dates;
        $scope.measures[unit].chartData = [resp.values];
    });
  };

  $scope.doRefresh = function() {
    Meditions.all().then(function(resp){
    $scope.medition = resp.data;

    // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
    });
  };

})

.controller('CapturasCtrl', function($scope, $interval, Pictures,ConfigConstants) {

  $scope.hasNext = false;
  $scope.hasPrev = false;
  $scope.pictures = {value:[]};
  $scope.picturesSize = {value:0};
  $scope.index = {value:null};

  $scope.playing = false;

  var playInterval;

  $scope.reload = function(){
    Pictures.all().then(function(pics){
        $scope.pictures.value = pics;
        $scope.hasNext = Pictures.hasNext();
        $scope.hasPrev = Pictures.hasPrev();
        $scope.index.value = pics.length-1;
    });
  }

  $scope.next = function(){
    Pictures.next();
    $scope.index.value = Pictures.current();
  }

  $scope.prev = function(){
    Pictures.prev();
    $scope.index.value = Pictures.current();
  }

  $scope.play = function(){
    $scope.playing = true;
    var currentVelocity = parseInt($scope.velocidad);
    playInterval = $interval(function(){

      if(currentVelocity != parseInt($scope.velocidad)){
        $interval.cancel(playInterval);
        $scope.play();
      }

      $scope.index.value = ($scope.index.value<$scope.picturesSize.value-1)?$scope.index.value+1:0; 
      Pictures.setCurrent($scope.index.value);
    },1000/((currentVelocity)+1));
    
  }

  $scope.pause = function(){
    $scope.playing = false;
    $interval.cancel(playInterval);
  }

  $scope.last = function(){
    $scope.index.value = parseInt($scope.picturesSize.value-1);
    Pictures.setCurrent($scope.index.value);
    $scope.index.value = Pictures.current();
  }

  $scope.first = function(){
    $scope.index.value = 0;
    Pictures.setCurrent($scope.index.value);
    $scope.index.value = Pictures.current();
  }

  $scope.changePhoto = function(elem){
    $scope.index.value = parseInt($scope.index.value);
    Pictures.setCurrent($scope.index.value);
    $scope.pause();
  }

})

.controller('FotosCtrl', function($scope, $interval, Pictures,ConfigConstants) {

  $scope.pause();

  $scope.imagesUrl = ConfigConstants.cameraUrl;
  $scope.title = "Capturas";
  
    Pictures.all().then(function(pics){

        for(i=0; i<pics.length; i++) {
           pics[i].show =false;
        }

        $scope.pictures.value = pics;
        $scope.picturesSize.value = pics.length;
        $scope.hasNext = Pictures.hasNext();
        $scope.hasPrev = Pictures.hasPrev();

        $scope.index.value = pics.length-1;
        pics[$scope.index.value].show = true;
        
        
    });
  
})

.controller('RadaresCtrl', function($scope, $interval, $ionicScrollDelegate, Pictures,ConfigConstants) {

  $scope.pause();

  $scope.imagesUrl = ConfigConstants.radarUrl

  $scope.title = "Radar";
  var frecuency = $scope.frecuencia;

  var processPictures =function(pics){

      for(i=0; i<pics.length; i++) {
        pics[i].show =false;
      }
      
      $scope.pictures.value = pics;
      $scope.picturesSize.value = pics.length;
      $scope.hasNext = Pictures.hasNext();
      $scope.hasPrev = Pictures.hasPrev();

      $scope.index.value = pics.length-1;
      pics[$scope.index.value].show = true;
  }

  setTimeout(function() {
    var delegate = $ionicScrollDelegate.$getByHandle('map');
    delegate.scrollTo(600, 330);
    delegate.zoomTo(0.6);
  },10);

  setInterval(function(){
    if(frecuency != $scope.frecuencia){
      Pictures.all("radares",$scope.frecuencia).then(processPictures);
    }
  },1000);

  Pictures.all("radares",$scope.frecuencia).then(processPictures);
  
})

.controller('InformacionCtrl', function($scope) {

})

.controller('EstacionesCtrl', function($scope,ConfigConstants,$cordovaInAppBrowser) {

  $scope.showStations = function(){

    var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'no'
    };

    if(window.cordova){

      document.addEventListener("deviceready", function () {
        $cordovaInAppBrowser.open(ConfigConstants.mapsUrl+'/index.htm', '_blank', options);

      }, false);

    } else {

        document.open(ConfigConstants.mapsUrl+'/index.htm', '_blank', options)

    }

  }

})

.controller('PronosticoCtrl', function($scope,ConfigConstants, Pronostico) {

  $scope.calculateWeather = function(){

  Pronostico.now().then(function(resp){
    $scope.ahora = {
          'pro':resp,
          'hour':moment.unix(resp.dt).format("HH")
        }
  });

  Pronostico.data().then(function(resp){

    var prono =  {
     'today':[],
     'days':[]
    };

    var prev = resp.list[0];
    var prevDay = moment.unix(prev.dt).format("DD");
    var i = 0;

    var todayDay = moment().format("DD");
    var day;

    if(prevDay == todayDay){
      prono.today.push({
          'pro':prev,
          'hour':moment.unix(prev.dt).format("HH")
        });
    } else {

      day = {
        'date':moment.unix(prev.dt).format("dddd DD/MM"),
        'pronos':[]
      } 

      day.pronos.push({
          'pro':prev,
          'hour':moment.unix(prev.dt).format("HH")
        });
    }
    
    var current, currentDay;

    while(i<resp.list.length-1){
      i++;
      current = resp.list[i];
      currentDay = moment.unix(current.dt).format("DD");

      if(currentDay == todayDay){

        prono.today.push({
            'pro':current,
            'hour':moment.unix(current.dt).format("HH")
          });

      } else {

        if(!day){
          day = {
              'date':moment.unix(current.dt).format("dddd DD/MM"),
              'pronos':[]
          }
        }

        if(currentDay != prevDay && day.pronos.length>0){
          prono.days.push(day);
          day = {
              'date':moment.unix(current.dt).format("dddd DD/MM"),
              'pronos':[]
          }
        }
        day.pronos.push({
            'pro':current,
            'hour':moment.unix(current.dt).format("HH")
          });
      }

      prev = current;
      prevDay = currentDay;

    }

    prono.days.push(day);

    $scope.pronostico = prono;

  });

  }

  $scope.calculateWeather();

  $scope.doRefresh = function() {
    $scope.ahora = null;
    $scope.pronostico = null;
    $scope.calculateWeather();
    $scope.$broadcast('scroll.refreshComplete');
  };

});
