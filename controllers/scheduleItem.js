const ScheduleItem = require('../models/scheduleItem');

exports.saveNewItem = (req, res) => {
    const { title, start, end, allDay } = req.body;
    const scheduleItem = new ScheduleItem({ title, start, end, allDay });

    //mongoDBにscheduleItemを登録
    scheduleItem.save((err, item) => {
        if (err) {
            console.log('SAVE ITEM ERROR', err);
            return res.status(401).json({
                error: 'Error saving item in database. Try again'
            });
        }
        return res.json({
            message: 'SUCCESS SAVING ITEM'
        });
    });
}

exports.readItems = (req, res) => {
    ScheduleItem.find().exec((err, items) => {
        if (err || !items) {
            return res.status(400).json({
                error: 'Items not found'
            });
        }
        return res.json({
            items: items,
            message: 'SUCCESS READING ITEM'
        });
    });
};