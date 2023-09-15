// app.js
const express = require('express');
const app = express();
const Swal = require('sweetalert2')
const userRoute = require('./routes/userRouter')
const adminRoute = require('./routes/adminRouter')
const config = require('./config/config');
const mongoose = require('mongoose')
const session = require('express-session');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const nocache = require('nocache');
mongoose.connect('mongodb+srv://versen:versen100@cluster0.uyas23q.mongodb.net/VERSEN')
dotenv.config();
const axios = require('axios')

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//for nocache
app.use(nocache());



// Serve static files from the public directory
app.use(express.static('public'));
app.use(session ({secret:config.sessionSecret}));

app.use('/' , userRoute);
app.use('/admin' ,adminRoute);


// Define routes and controllers

// Start the server
app.listen(9761, () => {
  console.log('Server is running on http://127.0.0.1:6235');
});






