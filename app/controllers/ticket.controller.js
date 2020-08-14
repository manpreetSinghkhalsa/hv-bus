const db = require("../models");
const Ticket = db.models.ticket;
const User = db.models.user;


function postUserFoundCallback(req, res, dbUserObj) {
  const ticketObj = new Ticket({
    user: dbUserObj,
    seat_number: req.body.seat_number,
    is_available: req.body.is_available,
    booked_date: new Date()
  });

  ticketObj.save(ticketObj).then(dbTicketObj => {
    res.status(200).send(dbTicketObj);
  }).catch(err => {
    console.log("Err in saving user obj");
    res.status(500).send({err: err});
  });
}

// Create and Save a new Tutorial
exports.create = (req, res) => {

  // TODO: Validations missing
  // TODO: This should be get or create
  const userObj = new User({
    name: req.body.name,
    phone: req.body.phone,
    created_at: new Date(),
    updated_at: new Date()
  });

  userObj
      .save(userObj)
      .then(dbUserData => postUserFoundCallback(req, res, dbUserData))
      .catch(err => {
        console.log("Err in saving user obj " + err);
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
