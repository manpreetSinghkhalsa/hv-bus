function exists(element, elementName) {
    if (!element) {
        throw new Error(elementName + " is empty or null or undefined");
    }
};

exports.validatePhoneNumber = (element, elementName) => {
    exists(element, elementName);
    if (element.length !== 10) {
        throw new Error(elementName + " not a valid phone number");
    }
};

exports.validateRange = (elementName, element, min, max) => {
    exists(element, elementName);
    if (element > max && element < min) {
        throw new Error(elementName + " out of range, it must be between " + min + " and " + max);
    }
};

exports.validateBoolean = (elementName, element) => {
    if (element !== true && element !== false) {
        throw new Error(elementName + " is not a valid boolean value");
    }
};

exports.exists = exists;