const mongoose = require('mongoose');
const defaultModel = require('../models/default.models');

// TODO: we can have history tables for tickets

let ticketSchemaObj = {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    seat_number: {
        type: Number,
        min: 1,
        max: 40,
        required: true
    },
    is_available: {
        type: Boolean,
        default: true
    },
    booked_date: {
        type: Date,
        default: Date.now()
    }
};


let finalTicketSchemaObj = Object.assign({}, ticketSchemaObj, defaultModel.attributes);

const TicketSchema = mongoose.Schema(finalTicketSchemaObj);

const modelObject = mongoose.model('Ticket', TicketSchema);
module.exports = modelObject;

module.exports.generateTicketSchema = (data) => {
    return new modelObject({
        user: data.user,
        seat_number: data.seatNumber,
        is_available: data.isAvailable,
        booked_date: data.bookedDate || new Date()
    });
};
