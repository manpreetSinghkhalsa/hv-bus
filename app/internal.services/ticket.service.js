const db = require("../models");

const Ticket = db.models.ticket;


function generateUpdateQuery(isAvailable, userObject) {
    let updateQuery = { $set: { is_available: isAvailable } };
    if (userObject) {
        updateQuery["$set"]["user"] = userObject;
    }
    return updateQuery;
}


function updateTicketStatus(seatNumber, isAvailable, userObject, responseObject, successCallback, errorCallback) {
    let filterObj = { seat_number: seatNumber };
    let updateQuery = generateUpdateQuery(isAvailable, userObject);

    Ticket.update(filterObj, updateQuery)
        .then(dbData => {
            successCallback(responseObject);
        })
        .catch(err => {
            errorCallback(responseObject);
            console.log("Err in updating ticket obj " + err);
        });
}


exports.generateAllTickets = () => {
    let listOfTicketObjects = [];
    let currentDateObj = new Date();
    for (let index = 0; index < 40; index++) {
        const ticketObj = Ticket.generateTicketSchema({
            user: undefined,
            seatNumber: index + 1,
            isAvailable: true,
            bookedDate: undefined,
            created_at: currentDateObj,
            updated_at: currentDateObj
        });
        listOfTicketObjects.push(ticketObj);
    }
    return listOfTicketObjects;
};

exports.changeTicketStatusToClosed = (requestObject, dbUserData, response) => {
    updateTicketStatus(requestObject.seatNumber, false, dbUserData, response,
        function (response) {
            return response.status(201).send();
        }, function (response) {
            return response.status(500).send({err: "Some error occurred."});
        });
};

exports.updateTicketStatus = updateTicketStatus;
