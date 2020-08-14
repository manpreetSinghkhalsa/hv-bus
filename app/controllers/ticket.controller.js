const ticketValidator = require("../validators/ticketValidator");
const internalTicketUtil = require("../internal.services/ticket.service");
const db = require("../models");

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


// Create a user and book ticket
exports.bookTicket = (req, res) => {
  let requestObject = generateBookTicketRequestObject(req);
  ticketValidator.validate(requestObject);

  // TODO: This should be get or create
  const userObj = User.generateUserObject(requestObject);

  userObj
      .save(userObj)
      .then(dbUserData => internalTicketUtil.changeTicketStatusToClosed(requestObject, dbUserData, res))
      .catch(err => {
        console.log("Err in saving user obj " + err);
        res.status(500).send({err: err});
      });
};


exports.updateTicketStatus = (req, res) => {
  let seatNumber = req.params.seatNumber;
  let requestObject = { seatNumber: req.params.seatNumber };

  ticketValidator.validateVacantSeatRequest(requestObject);

  internalTicketUtil.updateTicketStatus(seatNumber, true, false, res,function (response) {
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
