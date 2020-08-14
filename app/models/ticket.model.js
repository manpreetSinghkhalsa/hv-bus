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

module.exports = mongoose.model('Ticket', TicketSchema);
