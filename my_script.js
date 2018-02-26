var app = angular.module("app", ["leaflet-directive"]);
var urlString = "http://127.0.0.1:3000";
app.controller("TheController", ["$scope","$http", function($scope,$http) {
  angular.extend($scope, {
    castellon: {
      lat: 39.98685368305097,
      lng: -0.04566192626953125,
      zoom: 16
    },
    tiles: {
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    }
  })

  //To track the id based on the addition of the new Marker
  $scope.markers = new Array();
  var idList=[0];
  $scope.counter = 0;

  //Scoring solved and unsolved incidents
  $scope.solved = 0;
  $scope.unsolved = 0;

  //Markers array updater
  $(document).ready( function () {
    $scope.update_markers();
  });

//To check the count
  $scope.check_count = function (){
    $.ajax({
      url: urlString+"/catalog/home",
      type: 'GET'
    }).done (function (resp){
    })
  };


//To delete the items from the catalog
$scope.removeInfo = function(index) {
  $.ajax({
url: urlString+"/catalog/"+($scope.markers[index].id),
method: 'DELETE',
success: function(result) {
  console.log($scope.currentMarker);
        console.log("successfully deleted " + ($scope.currentMarker.id));
        console.log($scope.markers);
        console.log($scope.markers[index].id);
     $scope.markers.splice($scope.markers[index],1);
      $scope.$apply();
},
error: function(request,msg,error) {
    alert(error);
      $scope.$apply();
}
});
}



//To update the array
  $scope.update_markers = function () {
    $.ajax({
      url: urlString+"/catalog",
      type: 'GET'
    }).done (function (resp){
        $.each(resp, function (index, value){
          idList.push(parseFloat(value.id));
           $scope.markers.push({
             id: value.id,
             lat: parseFloat(value.lat),
            lng: parseFloat(value.lng),
            dueDate: new Date(value.dueDate),
            message: value.message,
            status: value.status,
            postalAddress: value.postalAddress
          })
         });
        $scope.counter = (Math.max.apply(Math, idList)+1);
        $.each($scope.markers, function (i,v){
          if (v.status == 'Unsolved'){
            $scope.unsolved++;
          }else {
            $scope.solved++;
          }
        })

        $scope.$apply();
    });
}


//Gets the lat long from the map
  $scope.$on("leafletDirectiveMap.mousedown", function (event,args) {
    var mouseButton = args.leafletEvent.originalEvent.button;
    if(mouseButton == 2) { // Right button
        latlng = args.leafletEvent.latlng;
        reverseGeocoding(latlng);
    }
});


//Ask for postal address
function reverseGeocoding(latlng) {
    var urlString = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" +
    latlng.lat + "&lon=" +
    latlng.lng + "&zoom=18&addressdetails=1";
    $http.get(urlString).then(addMarker);
}


//Customized icons
var local_icons = {
            defaultIcon: {},
            gmapicon: {
                iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/capital_big.png',
                iconSize:     [30, 30],
                iconAnchor:   [12, 12],
                popupAnchor:  [0, 0]
            }
        }

//Adds the marker to the map
function addMarker(response) {
    var marker = {
        id: $scope.counter,
        lat: parseFloat(response.data.lat),
        lng: parseFloat(response.data.lon),
        message: "Hello there",
        dueDate: new Date(),
        status: 'Unsolved',
        postalAddress: response.data.display_name,
        icon: local_icons.gmapicon
    };
    $scope.unsolved++;
    $scope.counter++;
    $scope.markers.push(marker);
    $scope.currentMarker = marker;
    $scope.post_marker();
}

  $scope.currentMarker = {};

  $scope.showInfo = function(index) {
    $scope.currentMarker = $scope.markers[index];
  }

  $scope.focus = function(index) {
    $scope.currentMarker = $scope.markers[index];
    $scope.currentMarker.focus=true;
    $scope.castellon.lat=$scope.currentMarker.lat;
    $scope.castellon.lng=$scope.currentMarker.lng;
  }




//Edit and updater
$scope.editInfo = function(index) {
  $scope.currentMarker = $scope.markers[index];
  //Switch solve and Unsolved
  $('#myToggle').change(function(index){
      if(this.checked) {
          $scope.currentMarker.status = 'Solved';
      }
      else {
          console.log($scope.currentMarker.status);
      }
  });
   $scope.edit = function(index) {
    var _data = angular.toJson($scope.currentMarker);

    $.ajax({
    url: urlString+"/catalog/"+$scope.currentMarker.id,
    method: 'PUT',
    data : _data,
    contentType: 'application/json'
  }).done(function (res){
    alert(res);
    $scope.$apply();
  })
  // error: function (er){
  //   console.log(er);
  // }
// })
}
}


//Adding new marker info to the database
  $scope.post_marker = function(){
        $.ajax({
          url: urlString+"/catalog",
          method: 'POST',
          data : JSON.stringify($scope.currentMarker),
          contentType: 'application/json',
          success : function (res){
            console.log($scope.solved);
            console.log($scope.unsolved);
            $scope.$apply();
        },
        error: function (xhr, status, error) {
          console.log('Error: ' + status);
          }
      })
    }
}]);
