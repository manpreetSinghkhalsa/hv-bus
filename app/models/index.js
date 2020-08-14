const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.models = {};
db.models.ticket = require("./ticket.model.js");
db.models.user = require("./user.model");

module.exports = db;
