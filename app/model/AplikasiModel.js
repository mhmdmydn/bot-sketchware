'use-strict'
const mongoose = require('mongoose');

const AplikasiSchema = new mongoose.Schema({
    file_name: {
        type: String,
        required: true,
        trim: true
    },
    file_id: {
        type: String,
        required: true,
    },
    file_unique_id: {
        type: String,
        require: true,
    },
    file_size: {
        type: String,
        required: true
    },
    uploader_name: {
        type: String,
        require: true
    },
    uploader_id: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', AplikasiSchema)