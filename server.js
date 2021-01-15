const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// connect to db
mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('DB connected'))
    .catch(err => console.log('DB CONNECTION ERROR: ', err));

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// app middlewares
//morgan:ログ出力するライブラリ
app.use(morgan('dev'));

app.use(bodyParser.json());
//cors：postmanを使う際にブラウザをCORS対応させる
// app.use(cors()); // allows all origins
if ((process.env.NODE_ENV = 'development')) {
    app.use(cors({ origin: `http://localhost:3000` }));
}

// middleware
//localhost:8000/api以降のgetリクエストを”./routes/auth.js”とuser.jsで処理する
app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.get("/", (res, req) => {
    res.redirect("api");
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`API is running on port ${port}`);
})
