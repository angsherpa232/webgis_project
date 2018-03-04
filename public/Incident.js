var db = require("./db");

var Incident = db.model('Incident', {
    id: {type: String},
    lat: {type: String},
    lng: {type: String},
    reportedDate: {type: Date, default: Date.now},
    status: {type: String},
    message: {type: String},
    postalAddress: {type: String}
});

module.exports = Incident;
