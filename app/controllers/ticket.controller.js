const adminValidator = require("../validators/adminValidator");
const ticketValidator = require("../validators/ticketValidator");
const internalTicketUtil = require("../internal.services/ticket.service");
const db = require("../models");
const async = require("async");

const Ticket = db.models.ticket;
const User = db.models.user;


function generateBookTicketRequestObject(req) {
  return {
    name: req.body.name,
    phone: req.body.phone,
    seatNumber: req.body.seatNumber,
    isAvailable: false
  }
}

function checkIfTicketIsAvailable(seatNumber, name, phone, callback) {
  const query = {seat_number: seatNumber, is_available: true};

  Ticket.findOne(query).then(dbTicketObj => {
    if (dbTicketObj) {
      return callback(null, dbTicketObj, name, phone);
    }
    const errorResponse = {
      message: "Ticket not available"
    };
    return callback(errorResponse);
  }).catch(err => {
    console.log("Error occurred while getting ticket obj, err: " + err);
    callback(err);
  });
}

function getUser(dbTicketObj, name, phone, callback) {
  const userFilter = { phone: phone };

  User.findOne(userFilter).then(dbUserObj => {
    if (!dbUserObj) {
      return callback(null, dbTicketObj, dbUserObj, name, phone);
    }
    const ticketFilter = { user: dbUserObj.id };
    Ticket.findOne(ticketFilter).then(dbData => {
      if (dbData) {
        const errorMessage = "Same user already having ticket, with seat number: " + dbData.seat_number;

        const errorResponse = {
          message: errorMessage
        };
        return callback(errorResponse);
      }
      callback(null, dbTicketObj, dbUserObj, name, phone);
    }).catch(err => {
      console.log("Error occurred while getting user object, err: " + err);

      const errorResponse = {
        message: "User creation failed"
      };
      return callback(errorResponse);
    });
  }).catch(err => {
    console.log("Error occurred while getting ticket obj, err: " + err);
    callback(err);
  });
}

function createUser(dbTicketObj, dbUserObj, name, phone, callback) {
  if (!dbUserObj) {
    const userObj = User.generateUserObject({ name: name, phone: phone });
    userObj.save(userObj).then(dbUserObj => {
      return callback(null, dbTicketObj, dbUserObj);
    }).catch(err => {
      console.log("Error occurred while creating user object, err: " + err);

      const errorResponse = {
        message: "User creation failed"
      };
      return callback(errorResponse);
    });
  } else {
    return callback(null, dbTicketObj, dbUserObj);
  }
}

function bookTicketDbChanges(dbTicketObj, dbUserObj, callback) {
  dbTicketObj.is_available = false;
  dbTicketObj.user = dbUserObj;

  dbTicketObj.markModified('is_available');
  dbTicketObj.markModified('user');

  dbTicketObj.save(dbTicketObj).then(dbObj => {
    return callback(null, dbObj);
  }).catch(err => {
    console.log("Error occurred while booking ticket, err: " + err);
    const errorResponse = {
      message: "Ticket book failed"
    };
    return callback(errorResponse);
  })
}

// Create a user and book ticket
exports.bookTicket = (req, res) => {
  let requestObject = generateBookTicketRequestObject(req);
  ticketValidator.validate(requestObject);

  async.waterfall([
    function starter(callback) {
      callback(null, requestObject.seatNumber, requestObject.name, requestObject.phone);
    },
    checkIfTicketIsAvailable,
    getUser,
    createUser,
    bookTicketDbChanges
  ], function (err, results) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send(results);
  });
};


exports.updateTicketStatus = (req, res) => {
  let seatNumber = req.params.seatNumber;
  let requestObject = { seatNumber: req.params.seatNumber };

  ticketValidator.validateVacantSeatRequest(requestObject);
  internalTicketUtil.updateTicketStatus(seatNumber, true, res, function (response) {
    return response.status(201).send();
  }, function (response) {
    return response.status(500).send({err: "Some error occurred."});
  });
};


exports.getAllBasedOnQueryParams = (req, res) => {
  let condition = {
    is_available: req.query.isAvailable === "true"
  };

  Ticket.find(condition).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving."
    });
  });
};


exports.findOne = (req, res) => {
  const seatNumber = req.params.seatNumber;
  const query = { seat_number: seatNumber };

  ticketValidator.validateSeatNumber({ seatNumber: seatNumber } );

  Ticket.find(query, { _id: 0, user: 0 })
    .then(data => {
      if (!data || data.length === 0) {
        res.status(404).send({message: "Ticket not found with seat number: " + seatNumber});
      } else {
        res.status(200).send(data);
      }
    }).catch(err => {
      res.status(500).send({ message: "Error retrieving Ticket with seat number: " + seatNumber });
    });
};


exports.findPassenger = (req, res) => {
  const seatNumber = req.params.seatNumber;
  const query = { seat_number: seatNumber };

  ticketValidator.validateSeatNumber({ seatNumber: seatNumber } );

  Ticket.find(query, { user: 1, _id: 0   })
      .populate("user")
      .then(data => {
        res.status(200).send(data);
      }).catch(err => {
        res.status(500).send({ message: "Error retrieving Ticket with seat number: " + seatNumber });
      });
};


exports.resetAllTickets = (req, res) => {
  adminValidator.validateIfAdmin(req.headers.username, req.headers.password);

  Ticket.deleteMany().then(dbResponse => {
    Ticket.insertMany(internalTicketUtil.generateAllTickets()).then(response => {
      res.status(200).send(response);
    }).catch(err => {
      console.log("Err: " + err);
      res.status(500).send({err: err});
    });
  }).catch(err => {
    console.log("Err: " + err);
    res.status(500).send({err: err});
  });
};
