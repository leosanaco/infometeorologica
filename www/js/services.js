angular.module('starter.services', [])

.factory('Pictures', function($http,$q,$filter,ConfigConstants) {
  // Might use a resource here that returns a JSON array
  var pictures = null;
  var currentIndex = 0; 
  var picturesLenght = 0;

  var pics = {
    fotos:[],
    radares:[]
  };

  var req = {
       method: 'GET',
       url: ConfigConstants.cameraUrl/*,
       headers: {
         'Content-Type': 'application/html'
     }*/
  }

  function getPicturesFromServer(type,frecuency){
    if(type=="fotos"){
      return getFotosFromServer();
    } else {
      return getRadaresFromServer(frecuency);
    }
  }

  function getRadaresFromServer(frecuency){
    var picturesProcesing = $q.defer();

    var picts = new Array();
    var from = 3*60;
    var step = 10;

    if(frecuency){
      step = frecuency*10;
    }

    var now = moment();
    now.subtract(20, 'minutes');
    now.subtract(from, 'minutes');

    for(var m=0; m<=from; m = m+step){

      now.add(step, "minutes");
      var minutes =Math.floor(parseInt(now.format('mm'))/10)*10;
      minutes = minutes==0?"00":minutes;

      var pic = {
        "img": "app_"+now.format('YYYYMMDDHH')+minutes+".png",
        "time": now.format('HH:mm'),
        "show": (m == from)
      }
          
       picts.push(pic);  

    }     

     pics["radares"] = picts;

     picturesProcesing.resolve(picts);

     return picturesProcesing.promise;

  }

  function getFotosFromServer(){


      var picturesProcesing = $q.defer();

      $http(req).then(function(data){

        function escapeRegExp(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

        var div = document.createElement('div');
        div.innerHTML = data.data;
        var items = div.querySelectorAll("li");
        var picts = new Array();

        for(i=0; i<items.length; i++) {
          var s = items[i].querySelector("img").src.split("/")
          var t = items[i].querySelector("div").textContent;
          var pic = {
            "img": s[s.length-1],
            "time": t,
            "show": i == items.length-1
          }

          picts.push(pic);
         
        }

        pics["fotos"] = picts;
        picturesLenght = picts.length;
        currentIndex = picturesLenght - 1;

        picturesProcesing.resolve(picts);

      });

      return picturesProcesing.promise;
  }

  function hasPrev(){
    return currentIndex != 0;
  }

  function hasNext(){
    return currentIndex + 1 <= picturesLenght - 1;
  }

  return {
    next: function(){
        if(this.hasNext()){
          pictures[currentIndex].show = false;
          pictures[++currentIndex].show = true;
        }
        return this.hasNext();
    },

    hasNext: hasNext,

    prev: function(){
        if(this.hasPrev()){
          pictures[currentIndex].show = false;
          pictures[--currentIndex].show = true;
        }
        return this.hasPrev();
    },

    hasPrev: hasPrev,

    refresh: function(){
      return getPicturesFromServer();
    },

    size: function(){
        return picturesLenght;
    },

    current: function(){
      return currentIndex;
    },

    setCurrent: function(index){
      if(pictures && index >= 0 && index <= picturesLenght - 1){
        pictures[currentIndex].show = false;
        currentIndex = index;
        pictures[currentIndex].show = true;
      }
    },

    all: function(type,frecuency) {

      if(!type){
        type = "fotos";
      }

      var promise;

      if(pics[type].length==0){
        promise = getPicturesFromServer(type,frecuency)
        
      } else {
        var defer = $q.defer();
        defer.resolve(pics[type]);
        promise = defer.promise;
      }

      promise.then(function(data){
        pictures = data; 
        picturesLenght = data.length;
        currentIndex = picturesLenght-1;
      })

      return promise;
    }
  }
})

.factory('Meditions', function($http, $q, ConfigConstants) {

  var history;
  var datos;

  function createUnit(elem,unit){

    var united = {
      unit:unit,
      dates:[],
      values:[]
    }

   for(var i=0; i<elem.items.length;i=i+12){
      console.log("cap",moment(elem.items[i]["captured_at"],"X").format("YYYY MM dd HH:mm:ss"));
      united.dates.push(moment(elem.items[i]["captured_at"],"X").format("HH")+"hs");
      united.values.push(elem.items[i][unit]);
    }

    return united;
  }

  function processData(deferer,unit){

    if(!datos){

      var now = moment();
      now.subtract(20, 'minutes').unix();

      var url = ConfigConstants.mapsUrl+'download?data=station&station=1&from='+now.subtract(12, 'hours').unix()+'&to='+now.add(12, 'hours').unix()//+'&callback=JSON_CALLBACK'+'&_='+moment().format("x");

     /**$http.jsonp(url)
      .success(function(data){
          console.log(data.found);
      });*/

      var req = {
         method: 'GET',
         url: url,
         headers: {
           "Content-Type": "text/html"
         },
         transformResponse: function(value) {
            return value.replace("(","").replace(")","").replace(";","");
          }
        }

      //$http.jsonp(url).success(function(data){
      $http(req).success(function(data){
        var elem = JSON.parse(data);
        datos = elem;
        deferer.resolve(createUnit(elem,unit));
      }).error(function(data){
          console.log("errorrr",data)
      });

    } else {
         deferer.resolve(createUnit(datos,unit));
    }
  }

  return {
    all: function() {
      return $http.get(ConfigConstants.meditionsUrl+'last?lang=es');
    },
    history: function(unit){

      if(!unit){
        unit = "temperature";
      }

      var picturesProcesing = $q.defer();

      processData(picturesProcesing,unit);

      return picturesProcesing.promise;
    }
  }
})

.factory('Pronostico', function($http, $q, ConfigConstants) {

  
  function getData(deferer,params){

      var req = {
         method: 'GET',
         url: ConfigConstants.weatherUrl + params,
         headers: {
           "Content-Type": "text/html"
         }
        }

      $http(req).success(function(data){
        deferer.resolve(data);
      }).error(function(data){
          console.log("errorrr",data)
      });
  }

  return {
    all: function() {
      return $http.get(ConfigConstants.meditionsUrl+'last?lang=es');
    },
    data: function(){

      var weatherData = $q.defer();
      getData(weatherData,"forecast?id=3432043&units=metric&lang=es&appid=4ca3a2ee6b3f40a139c0c633415009d3");
      return weatherData.promise;
    },
    now: function(){
      var weatherData = $q.defer();
      getData(weatherData,"weather?id=3432043&units=metric&lang=es&appid=4ca3a2ee6b3f40a139c0c633415009d3");
      return weatherData.promise;
    }
  }
})


 
