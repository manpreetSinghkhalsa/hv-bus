let validators = require("./commonValidators");

exports.validateIfAdmin = (username, password) => {
    validators.exists(username, "Username");
    validators.exists(password, "Password");

    if (username !== "admin" || password !== "admin") {
        throw new Error("Invalid username or password");
    }
};