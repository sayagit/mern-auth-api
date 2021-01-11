const User = require('../models/user');

exports.read = (req, res) => {
    const userId = req.params.id;
    User.findById(userId).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    });
};

exports.update = (req, res) => {
    //requireSigninミドルウェアのおかげでreqからデータをとってこれる
    // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);

    const { name, password } = req.body;

    //DBで該当userを検索
    User.findOne({ _id: req.user._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (!name) { //req.bodyにnameがない場合、nameは必須のためエラーを出す
            return res.status(400).json({
                error: 'Name is required'
            });
        } else {
            user.name = name;
        }
        //req.bodyにpasswordがある場合、それを新しいパスワードとする
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Password should be min 6 characters long'
                });
            } else {
                user.password = password;
            }
        }

        //userを保存(上書き)する
        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};