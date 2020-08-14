let default_model_attributes = {
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
};

module.exports.attributes = default_model_attributes;