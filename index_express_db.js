var express = require('express');
var app = express();
var port = 3000;

//To pass the CORS security
var cors = require('cors');
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//To parse the body for POST method
var bodyParser = require("body-parser");
app.use(bodyParser.json({type: 'application/json'}));
//To use the static file
app.use(express.static(__dirname + "/public"))
var Incident = require("./public/incident");


//Gets the incidents
app.get("/catalog", function(req, res) {
    var stream = Incident.find().stream();
    var results = {};
    stream.on('data', function(doc) {
            results[doc.id] = doc;
        }).on("error", function(err) {
            res.status(500);
            next(err);
        }).on('close', function() {
            res.status(200);
            res.json(results);
    });
});

//Gets the incident as per requested id
app.get("/catalog/:id", function(req, res, next) {
    var idIncident = req.params.id;
    Incident.findOne({id: idIncident}, function(err, incident) {
        if(err) {
            res.status(500);
            next("Internal server error.");
        } else if(incident == null) {
            res.status(404); // Not found
            next("No incident with code " + idIncident + " found.");
        } else {
            res.status(200);
            res.json(incident);
        }
    });
  });



//Post method to add new incident in the database if not previously existed
app.post("/catalog", function(req, res, next) {
  const idIncident = req.body.id;
  const incident = req.body;
  Incident.findOne({id: idIncident}, function (err, incident){
    if (err){
      res.status(500);
      next("Internal server error");
    } else if (incident != null){
      res.send("A incident with id = "+idIncident +"already exists in the DB")
    }
  });

  Incident.create(incident, function (err, result){
    if (err){
      res.status(500);
      next("Internal server error");
    }else {
      res.set("Location", "http://localhost:3000/" + idIncident);
      res.send(result);
    }
    });
});


//Handling put request
app.put("/catalog/:id", function (req, res, next){
  const uri_id = req.params.id;
  const incident = req.body;
  Incident.update({id:uri_id}, incident, function (err, result){
    if (err){
      res.status(500);
      next(err);
    }else {
    res.set("Location", "http://localhost:3000/catalog/"+uri_id);
       res.send(result);
    }
  })
})

//Delete the incident as per requested id
app.delete("/catalog/:id", function (req, res, next){
  const idIncident = req.params.id;
  Incident.remove({"id": idIncident},function (err, result){
    res.send("Deleted successfully");
    if (result.n == 0){
      res.send("No incident with this id");
    }else{
    res.send();
  }
  });
});

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port);
});
