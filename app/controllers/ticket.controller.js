const ticketValidator = require("../validators/ticketValidator");
const commonValidator = require("../validators/commonValidators");

const db = require("../models");
const Ticket = db.models.ticket;
const User = db.models.user;


function postUserFoundCallback(requestObject, res, dbUserObj) {
  const ticketObj = Ticket.generateTicketSchema({
    user: dbUserObj, seatNumber: requestObject.seatNumber, isAvailable: requestObject.isAvailable
  });

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
      .then(dbUserData => postUserFoundCallback(requestObject, res, dbUserData))
      .catch(err => {
        console.log("Err in saving user obj " + err);
        res.status(500).send({err: err});
      });
};


// TODO: Need to test this
exports.updateTicketStatus = (req, res) => {
  let requestObject = { seatNumber: req.params.seatNumber };

  ticketValidator.validateVacantSeatRequest(requestObject);

  let filterObj = { seat_number: requestObject.seatNumber };
  let updateQuery = { $set: { is_available: true } };

  Ticket.update(filterObj, updateQuery)
      .then(dbData => {
        res.status(200);
      })
      .catch(err => {
        console.log("Err in updating ticket obj " + err);
        res.status(500).send({err: err});
      });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const condition = {
    is_available: req.query.isAvailable
  };

  Ticket.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving."
        });
      });
};


// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  // TODO: Add validations for the range
  const seatNumber = req.params.seatNumber;
  const query = { seat_number: seatNumber };
  // Ticket.find(query, { seat_number: 1, booking_date: 1, is_available: 1})
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
  // TODO: Add validations for the range
  const seatNumber = req.params.seatNumber;
  const query = { seat_number: seatNumber };
  // Ticket.find(query, { seat_number: 1, booking_date: 1, is_available: 1})
  // Ticket.find(query, { user: 1 }).populate('User')
  // Ticket.find(query, { seat_number: 0, is_available: 0, booked_date: 0   })
  Ticket.find(query, { user: 1, _id: 0   })
      .populate("user")
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
