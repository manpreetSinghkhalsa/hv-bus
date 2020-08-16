const db = require("../models");

const User = db.models.user;
const ticketInternalUtils = require("./ticket.service");


exports.getUser = (dbTicketObj, name, phone, callback) => {
    const userFilter = { phone: phone };

    User.findOne(userFilter).then(dbUserObj => {
        if (!dbUserObj) {
            return callback(null, dbTicketObj, dbUserObj, name, phone);
        }

        ticketInternalUtils.getTicketFromDb(dbUserObj.id, dbData => {
            if (dbData) {
                const errorMessage = "Same user already having ticket, with seat number: " + dbData.seat_number;

                const errorResponse = {
                    message: errorMessage
                };
                return callback(errorResponse);
            }
            callback(null, dbTicketObj, dbUserObj, name, phone);
        }, err => {
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
};


exports.createUser = (dbTicketObj, dbUserObj, name, phone, callback) => {
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
};

