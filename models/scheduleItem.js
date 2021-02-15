const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    start: String,
    end: String,
    allDay: Boolean
})

module.exports = mongoose.model('ScheduleItem', scheduleItemSchema);