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

module.exports = mongoose.model('User', UserSchema);
