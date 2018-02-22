var app = angular.module("app", ["leaflet-directive"]);
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
  $scope.markers = new Array();
  //double click on left button gives the new marker and also zooms the map
  // $scope.$on("leafletDirectiveMap.click", function (event,args) {
  //     var latlng = args.leafletEvent.latlng;
  //     $scope.markers.push({
  //         lat: latlng.lat,
  //         lng: latlng.lng,
  //         message: "Hello"
  //     });
  // });


  //Right is for marker and left button is for zooming
  // $scope.$on("leafletDirectiveMap.mousedown", function(event, args) {
  //   var mouseButton = args.leafletEvent.originalEvent.button;
  //
  //   if (mouseButton == 2) { // Right button
  //     var latlng = args.leafletEvent.latlng;
  //
  //     $scope.markers.push({
  //       lat: latlng.lat,
  //       lng: latlng.lng,
  //       message: "Hello",
  //       dueDate: new Date()
  //     });
  //   }
  // });

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

//Adds the marker to the map
function addMarker(response) {
    var marker = {
        lat: parseFloat(response.data.lat),
        lng: parseFloat(response.data.lon),
        message: "Hello",
        dueDate: new Date(),
        postalAddress: response.data.display_name
    };
    $scope.markers.push(marker);
    $scope.currentMarker = marker;
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

  $scope.removeInfo = function(index) {
    $scope.currentMarker = $scope.markers.splice(index,1);
  }



}]);
