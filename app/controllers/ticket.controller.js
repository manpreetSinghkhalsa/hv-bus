const ticketValidator = require("../validators/ticketValidator");
const db = require("../models");

const Ticket = db.models.ticket;
const User = db.models.user;


function postUserFoundCallback(requestObject, res, dbUserObj) {
  const ticketObj = Ticket.generateTicketSchema({
    user: dbUserObj, seatNumber: requestObject.seatNumber, isAvailable: requestObject.isAvailable
  });

  // TODO: Need to update the isAvailable instead of creating new entry
  ticketObj.save(ticketObj).then(dbTicketObj => {
    res.status(200).send(dbTicketObj);
  }).catch(err => {
    console.log("Err in saving user obj " + err);
    res.status(500).send({err: err});
  });
}


function generateBookTicketRequestObject(req) {
  return {
    name: req.body.name,
    phone: req.body.phone,
    seatNumber: req.body.seatNumber,
    isAvailable: false
  }
}


// Create a user and book ticket
exports.bookTicket = (req, res) => {
  let requestObject = generateBookTicketRequestObject(req);
  ticketValidator.validate(requestObject);

  // TODO: This should be get or create
  const userObj = User.generateUserObject(requestObject);

  userObj
      .save(userObj)
      .then(dbUserData => {
        updateTicketStatus(requestObject.seatNumber, false, dbUserData, res,
            function (response) {
          return response.status(201).send();
          }, function (response) {
          return response.status(500).send({err: "Some error occurred."});
        });
      })
      .catch(err => {
        console.log("Err in saving user obj " + err);
        res.status(500).send({err: err});
      });
};


function updateTicketStatus(seatNumber, isAvailable, userObject, responseObject, successCallback, errorCallback) {
  let filterObj = { seat_number: seatNumber };
  let updateQuery = { $set: { is_available: isAvailable } };
  if (userObject) {
    updateQuery["$set"]["user"] = userObject;
  }

  Ticket.update(filterObj, updateQuery)
      .then(dbData => {
        successCallback(responseObject);
      })
      .catch(err => {
        errorCallback(responseObject);
        console.log("Err in updating ticket obj " + err);
      });
}

exports.updateTicketStatus = (req, res) => {
  let seatNumber = req.params.seatNumber;
  let requestObject = { seatNumber: req.params.seatNumber };

  ticketValidator.validateVacantSeatRequest(requestObject);

  updateTicketStatus(seatNumber, true, false, res,function (response) {
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

// TODO: have to clean this one

exports.resetAllTickets = (req, res) => {
  // TODO: Add validations for the range

  Ticket.deleteMany().then(allTicketsData => {
    let listOfTicketObjects = [];
    let currentDateObj = new Date();
    for (let index = 0; index < 40; index++) {
      const ticketObj = new Ticket({
        user: undefined,
        seat_number: index + 1,
        is_available: true,
        booked_date: undefined,
        created_at: currentDateObj,
        updated_at: currentDateObj
      });
      listOfTicketObjects.push(ticketObj);
    }

    Ticket.insertMany(listOfTicketObjects).then(response => {
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
