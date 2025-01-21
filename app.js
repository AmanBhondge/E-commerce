require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyparser = require('body-parser');


const userRoute = require('./api/routes/user');
const imgRoute = require('./api/routes/img');
const { MONGO_URI } = require('./config');

mongoose.connect(MONGO_URI)
mongoose.connection.on('error', err => {
    console.log("connectin failed");

});
mongoose.connection.on('connected', connected => {
    console.log("connected with db");
})

app.use(bodyparser.urlencoded({extended:false}));
app.use(cors());
app.use(bodyparser.json());



    
    app.use('/user', userRoute);
    app.use('/img', imgRoute);


    app.use((req, res, next) => {
        res.status(404).json({
            message: "bad request"
        })

    })


    module.exports = app;