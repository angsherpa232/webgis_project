var db = require("./db");

var Product = db.model('Product', {
    id: {type: String},
    lat: {type: String},
    lng: {type: String},
    dueDate: {type: Date, default: Date.now},
    status: {type: String},
    message: {type: String},
    postalAddress: {type: String}
});

module.exports = Product;
