var express = require('express');
var router = express.Router();
const cors = require('cors');
router.use(cors());
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const User = require('../models/user');
const randomKey = require('random-key');
const CryptoJS = require('crypto-js');



// Connecting to my mongodb
const dbURI = 'mongodb+srv://igor2021:igor2021@cluster0.hnt8d.mongodb.net/nyhetsbrev?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log('uppkopplad mot databasen')) // Kan behöva lägga in listen på servern istället för console.log så att man inte gör anrop innan db laddas
  .catch((err) => console.log(err));


/* GET users listing. */
router.get('/', function (req, res, next) {

  res.send('Hello users');
});

router.post('/new', function (req, res, next) {
  console.log(req.body);

  let userPass = req.body.userPassword;
  let encryptPass = CryptoJS.AES.encrypt(userPass, 'SecretKey123').toString();

  const user = new User({
    id: randomKey.generate(),
    userName: req.body.userEmail,
    userPassword: encryptPass,
    subscription: req.body.subscription
  });

  user.save().then((result) => {
    res.json('ny användare sparad');
  })
    .catch((err) => { console.log(err) })


});

module.exports = router;
