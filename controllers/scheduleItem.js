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
            message: 'SUCCESS SAVING ITEM',
            item: item
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

//DBで該当scheduleItemを検索→saveで上書き
exports.updateItem = (req, res) => {
    const { id, title, start, end, allday } = req.body;
    ScheduleItem.findOne({ _id: id }, (err, item) => {
        if (err || !item) {
            return res.status(401).json({
                error: 'ITEM NOT FOUND'
            });
        } else {
            item.title = title;
            item.start = start;
            item.end = end;
            item.allday = allday;
        }

        //scheduleItemを保存(上書き)する
        item.save((err, updatedItem) => {
            if (err) {
                console.log('ITEM UPDATE ERROR', err);
                return res.status(401).json({
                    error: 'ITEM UPDATE FAILED'
                });
            }
            return res.json({
                item: updatedItem,
                message: "SUCCESS UPDATING ITEM"
            });
        });
    });
}
