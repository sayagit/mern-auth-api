//リクエストからvalidationエラーを抽出し、Resultオブジェクトで利用できるようにします。
const { validationResult } = require('express-validator');

exports.runValidation = (req, res, next) => {
    //このResultオブジェクトerrors(array)でvalidationエラーを利用できる
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }
    next();
};
