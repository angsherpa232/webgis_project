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

// var catalog = new Object(); // A Map of javascript Objects.
// catalog[0] = {
//   id:0,
//   name: "USB drive",
//    price: 10
//  };
// catalog[1] = {
//   id:1,
//   name: "Mouse",
//   price: 20
// };
// catalog['tmp']={
//   id : 'tmp',
//   name: "No name",
//   price: 0
// };

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
//next is for addresssing error
// app.get('/catalog/:id',function (req, res, next){
//   var id = req.params.id;
//   //console.log(req);
//   console.log(id);
//   if (id in catalog){
//     res.json(catalog[id]);
//   } else {
//     res.status(404);
//     res.send("That product is not in our catalog");
//   }
// });

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


app.get('/hello', function (req, res){
  res.send("Hello");
});

app.get('/bye', function (req, res){
  res.send("Bye");
});

//Post method to add new items in the catalog if not previously existed
app.post("/catalog", function(req, res, next) {
  const idProduct = req.body.id;
  const product = req.body;
  Product.findOne({id: idProduct}, function (err, product){
    if (err){
      res.status(500);
      next("Internal server error");
    } else if (product != null){
      res.status(400);
      res.send("A product with id = "+idProduct +"already exists in the DB")
    }
  });

  Product.create(product, function (err, result){
    if (err){
      res.status(500);
      next("Internal server error");
    }else {
      res.set("Location", "http://localhost:3000/" + idProduct);
      res.status(201);
      res.send(201);
    }
    });
});
  // console.log(req.body.ID);
  //   var id = req.body.ID;


app.put("/catalog/:id", function (req, res, next){
  const uri_id = req.params.id;
  const id = req.body.id;
  if(uri_id != id){
    res.status(400);
    next("The uri "+ uri_id + "and id "+id + "does not match.")
  }
  if(id in catalog){//OK
    catalog[id] = req.body;
    res.status(200);
    res.send();
  }else{//Bad request
    res.status(400);
    next("Product with id " + id + " is not in the cataclog");
  }
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
