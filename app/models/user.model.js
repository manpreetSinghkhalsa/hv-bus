const mongoose = require('mongoose');
const defaultModel = require('../models/default.models');


let userSchemaObject = {
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true
    }
};

let finalUserSchemaObject = Object.assign({}, userSchemaObject, defaultModel.attributes);

const UserSchema = mongoose.Schema(finalUserSchemaObject);

const UserModelObj = mongoose.model('User', UserSchema);

module.exports = UserModelObj;

module.exports.generateUserObject = (data) => {
    return new UserModelObj({
        name: data.name,
        phone: data.phone,
        created_at: new Date(),
        updated_at: new Date()
    });
};
