let commonValidations = require("./commonValidators.js");

exports.validate = (requestObj) => {
    commonValidations.exists(requestObj.name, "name");
    commonValidations.validatePhoneNumber(requestObj.phone, "phone");
    commonValidations.validateRange("seat number", requestObj.seatNumber, 1, 40);
    commonValidations.validateBoolean("is available", requestObj.isAvailable);
    // TODO: Check if the seat is already Booked or not
};
