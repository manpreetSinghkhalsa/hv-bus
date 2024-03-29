const express = require("express");
const bodyParser = require("body-parser");
// const cors = require("cors");

const app = express();


// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


require("./app/routes/routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
const serverInstance = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

exports.serverInstance = serverInstance;
