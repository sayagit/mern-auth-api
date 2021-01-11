const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
require('dotenv').config();

// sendgrid
const sgMail = require('@sendgrid/mail');
const apiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(apiKey);

exports.signup = (req, res) => {
    const { name, email, password } = req.body;

    //UserのEmailが既にDB登録済みの場合エラーを出す
    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
    })

    //jwt.sign(payload, secretOrPrivateKey, [options, callback])
    // クライアント側から認証情報（例：ユーザー名、パスワード）をサーバーに送信
    // サーバー側で認証情報を確認し、認証OKの場合JWTを発行し、クライアント側に返却
    // クライアントは次回以降、JWTを付与したリクエストを送信
    // サーバー側はJWTを検証する
    const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

    //htmlメール
    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account activation link`,
        html: `
            <h1>Please use the following link to activate your account</h1>
            <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `
    };

    //SendGridを使用してメールを送信
    sgMail.send(emailData).then(sent => {
        // console.log('SIGNUP EMAIL SENT', sent)
        return res.json({
            message: `Email has been sent to ${email}. Follow the instruction to activate your account`
        });
    })
        .catch(err => {
            // console.log('SIGNUP EMAIL SENT ERROR', err)
            return res.json({
                message: err.message
            });
        });
}

exports.accountActivation = (req, res) => {
    const { token } = req.body;

    if (token) {
        // jwt.signで発行されたトークンの検証→認証OKあるいはerror
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                });
            } else {
                //認証OKであればトークンからnname, emailなどをdecodeする
                const { name, email, password } = decoded
                //mongoDBの新しいuser作成
                const user = new User({ name, email, password });
                //mongoDBにuserを登録
                user.save((err, user) => {
                    if (err) {
                        console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
                        return res.status(401).json({
                            error: 'Error saving user in database. Try signup again'
                        });
                    }
                    return res.json({
                        message: 'Signup success. Please signin.'
                    });
                });
            }


        });
    } else {
        return res.json({
            message: 'Something went wrong. Try again.'
        });
    }
};

exports.signin = (req, res) => {
    const { email, password } = req.body;
    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            //errが発生あるいはuserがいなかった場合
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match'
            });
        }
        // generate a token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { _id, name, email, role } = user;

        return res.json({
            token,
            user: { _id, name, email, role }
        });
    });
};

//JWT（JSON Webトークン）を検証するためのExpressミドルウェア
//このミドルウェアをどのルーターで認証してもreq.user._idでidが取得出来る
//Authorizationリクエストヘッダーにvalid tokenがあればこのミドルウェアで認証される
//※algorithmsはこの内容じゃないとinvalid algorithmエラーなどが発生する
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET, // req.user
    algorithms: ['sha1', 'RS256', 'HS256']
});

//admin以外のアクセスを制限する
exports.adminMiddleware = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'Admin resource. Access denied.'
            });
        }

        req.profile = user;
        next();
    });
}