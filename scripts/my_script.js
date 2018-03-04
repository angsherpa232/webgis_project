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

  //Array to hold the markers
  $scope.markers = new Array();
  //To assign a unique id to the new Marker
  var idList=[0];
  $scope.counter = 0;

  //Scoring solved and unsolved incidents to render in browser
  $scope.solved = 0;
  $scope.unsolved = 0;

  //Loads the markers from the database into browser
  $(document).ready( function () {
    $scope.load_markers();
  });


//To load the existing markers from Mongodb
  $scope.load_markers = function () {
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
            reportedDate: new Date(value.reportedDate),
            message: value.message,
            status: value.status,
            postalAddress: value.postalAddress
          })
         });
        //$scope.counter tracks the customized id of marker
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
    $("#addModel").modal("show");
    var marker = {
        id: $scope.counter,
        lat: parseFloat(response.data.lat),
        lng: parseFloat(response.data.lon),
        message: "Enter the description",
        reportedDate: new Date(),
        status: 'Unsolved',
        postalAddress: response.data.display_name,
        icon: local_icons.gmapicon
    };
    $scope.unsolved++;
    $scope.counter++;
    $scope.currentMarker = marker;
    return $scope.currentMarker;
}

  $scope.currentMarker = {};

  //Adding new marker info to the database
    $scope.post_marker = function(currentMarker){
      $scope.markers.push($scope.currentMarker);
          $.ajax({
            url: urlString+"/catalog",
            method: 'POST',
            data : JSON.stringify($scope.currentMarker),
            contentType: 'application/json',
            success : function (res){
              $("#addModel").modal("hide");
              $scope.$apply();
          },
          error: function (xhr, status, error) {
            console.log('Error: ' + status);
            }
        })
      }

  $scope.showInfo = function(index) {
    $scope.currentMarker = $scope.markers[index];
  }

  $scope.focus = function(index) {
    $scope.currentMarker = $scope.markers[index];
    $scope.currentMarker.focus=true;
    $scope.castellon.lat=$scope.currentMarker.lat;
    $scope.castellon.lng=$scope.currentMarker.lng;
  }




//Edit the description
$scope.editInfo = function(index) {
  $scope.currentMarker = $scope.markers[index];
  //Switch solve and Unsolved
  $('#myToggle').change(function(index){
      if(this.checked) {
          $scope.currentMarker.status = 'Solved';
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
    $scope.$apply();
    window.location.reload();
  })
}
}

//To delete the items from the database
$scope.removeInfo = function(index) {
  $.ajax({
url: urlString+"/catalog/"+($scope.markers[index].id),
method: 'DELETE',
success: function(result) {
     $scope.markers.splice($scope.markers[index],1);
      $scope.$apply();
      window.location.reload();
},
error: function(request,msg,error) {
    console.log(error);
      $scope.$apply();
}
});
}

}]);
