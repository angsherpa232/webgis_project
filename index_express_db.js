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
//app.use(express.static(__dirname + "/./node_modules/public"))
app.use(express.static(__dirname + "/public"))
var Product = require("./public/model/product");
//app.use(express.static(__dirname + ".public/modal/my_script");


app.get("/catalog", function(req, res) {
    var stream = Product.find().stream();
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

// app.get("/catalog/:home", function(req, res) {
//     Product.count({}, function (err, count){
//       res.send("The count is " + count);
//     });
//   });


app.get("/catalog/:id", function(req, res, next) {
    var idProduct = req.params.id;
    Product.findOne({id: idProduct}, function(err, product) {
        if(err) {
            res.status(500);
            next("Internal server error.");
        } else if(product == null) {
            res.status(404); // Not found
            next("No product with code " + idProduct + " found.");
        } else {
            res.status(200);
            res.json(product);
        }
    });
  });



//Post method to add new items in the catalog if not previously existed
app.post("/catalog", function(req, res, next) {
  const idProduct = req.body.id;
  const product = req.body;
  //console.log(idProduct);
  Product.findOne({id: idProduct}, function (err, product){
    if (err){
      res.status(500);
      next("Internal server error");
    } else if (product != null){
      //res.status(400);
      res.send("A product with id = "+idProduct +"already exists in the DB")
    }
  });

  Product.create(product, function (err, result){
    //console.log("The product is " + result);
    if (err){
      res.status(500);
      next("Internal server error");
    }else {
      res.set("Location", "http://localhost:3000/" + idProduct);
      //res.status(201);
      //res.send(201);
      res.send(result);
    }
    });
});


//Handling put request
app.put("/catalog/:id", function (req, res, next){
  const uri_id = req.params.id;
  const product = req.body;
  Product.findOne({id: uri_id}, function (err, product){
    if (err){
      res.status(500);
      next("Internal server error");
    } else if (product == null){
      res.send(201);
    }
  });
  Product.update(product, function (err, result){
    if (err){
      res.status(500);
      next(err);
    }else {
    res.set("Location", "http://localhost:3000/catalog/");
       res.send(201);
    }
    })
})


app.delete("/catalog/:id", function (req, res, next){
  const idProduct = req.params.id;
  Product.remove({"id": idProduct},function (err, result){
    res.send("Deleted successfully");
    if (result.n == 0){
      res.send("No product with this id");
    }else{
    console.log("successfully deleted");
  }
  });
});

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port);
});
