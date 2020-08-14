let commonValidations = require("./commonValidators.js");

function validateSeatNumber(requestObj) {
    commonValidations.validateRange("seat number", requestObj.seatNumber, 1, 40);
}

exports.validate = (requestObj) => {
    commonValidations.exists(requestObj.name, "name");
    commonValidations.validatePhoneNumber(requestObj.phone, "phone");
    validateSeatNumber(requestObj);
    commonValidations.validateBoolean("is available", requestObj.isAvailable);
    // TODO: Check if the seat is already Booked or not
};

exports.validateVacantSeatRequest = (requestObj) => {
    validateSeatNumber(requestObj);
    // TODO: Validate that seat is already taken
};

exports.validateSeatNumber = validateSeatNumber;