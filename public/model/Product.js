var db = require("./db");

var Product = db.model('Product', {
  id: {type: String, required: true},
    lat: {type: String, required: true},
    lng: {type: String, required: true},
    message: {type: String, required: true},
    dueDate: {type: String, required: true}
});

module.exports = Product;
