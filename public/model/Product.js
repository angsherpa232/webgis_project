var db = require("./db");

var Product = db.model('Product', {
    id: {type: String},
    lat: {type: String},
    lng: {type: String},
    message: {type: String},
    dueDate: {type: String},
    postalAddress: {type: String}
});

module.exports = Product;
