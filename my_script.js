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
  $scope.counter = $scope.markers.length;


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


//To update the array
  $scope.update_markers = function () {
    $.ajax({
      url: urlString+"/catalog",
      type: 'GET'
    }).done (function (resp){
        $.each(resp, function (index, value){
          console.log(value);
           $scope.markers.push({
             id: value.id,
             lat: parseFloat(value.lat),
            lng: parseFloat(value.lng),
            dueDate: value.dueDate,
            message: value.message,
            postalAddress: value.postalAddress
          })
         });
          $scope.counter = $scope.markers.length;
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

//Adds the marker to the map
function addMarker(response) {
    var marker = {
        id: $scope.counter,
        lat: parseFloat(response.data.lat),
        lng: parseFloat(response.data.lon),
        message: "Hello there",
        dueDate: new Date(),
        postalAddress: response.data.display_name
    };
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

  $scope.removeInfo = function(index) {
    $scope.currentMarker = $scope.markers.splice(index,1);
  }


  //To delete the items from the catalog
//   $scope.removeInfo = function(id) {
//     $.ajax({
//   url: urlString+"/catalog/"+id,
//   method: 'DELETE',
//   contentType: 'application/json',
//   success: function(result) {
//       console.log("successfully deleted " + id);
//       //$("#form-message").html("<p>Successfully deleted: </p>"+id);
//         $scope.$apply();
//   },
//   error: function(request,msg,error) {
//       alert(error);
//   }
// });
//   }

//Adding new marker info to the database
  $scope.post_marker = function(){
        $.ajax({
          url: urlString+"/catalog",
          method: 'POST',
          data : JSON.stringify($scope.currentMarker),
          contentType: 'application/json',
          success : function (res){
            console.log(res);
            $scope.$apply();
        },
        error: function (xhr, status, error) {
          console.log('Error: ' + status);
          }
      })
    }
}]);
