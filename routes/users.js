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

// Post router för ny user
router.post('/new', (req, res, next) => {

  User.find({ userName: req.body.userEmail })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        res.status(422).json({
          message: 'Användare existerar redan'
        });
      } else {
        let userPass = req.body.userPassword;
        let encryptPass = CryptoJS.AES.encrypt(userPass, 'SecretKey123').toString();

        const user = new User({
          id: randomKey.generate(),
          userName: req.body.userEmail,
          userPassword: encryptPass,
          subscription: req.body.subscription
        });

        user.save().then((result) => {
          console.log(result)
          res.status(201).json({
            message: 'ny användare sparad',
            userId: result.id,
            userName: result.userName,
            subscription: result.subscription
          });
        })
          .catch((err) => { console.log(err), res.json({ message: 'Vänligen fyll i alla fält för att registrera din email' }) });
      }
    })
    .catch((err) => console.log(err));
});

// Post router för login
router.post('/login', (req, res, next) => {
  User.find({ userName: req.body.userEmail })
    .exec()
    .then(user => {

      if (user.length < 1) {
        return res.status(422).json({
          message: 'Fel användarnamn eller lösenord ifyllt'
        });
      }
      let originalPass = CryptoJS.AES.decrypt(user[0].userPassword, 'SecretKey123').toString(CryptoJS.enc.Utf8);
      if (originalPass == req.body.userInputPassword) { // Kan ändra req.body.userInputPassword till req.body.userPassword
        res.status(200).json({
          userId: user[0].id,
          userName: user[0].userName,
          subscription: user[0].subscription
        })
      } else {
        res.status(422).json({
          message: 'Fel användarnamn eller lösenord ifyllt'
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.json('error');
    })
});

// Post router för ändring av prenumerationsstatus
router.post('/sub', (req, res, next) => {

  User.findOne({ id: req.body.userId })
    .exec()
    .then(user => {

      if (user.subscription != req.body.newSubscriptionChoice) {
        user.subscription = req.body.newSubscriptionChoice

        user.save();
        res.status(200).json({
          userName: user.userName,
          newSubscriptionChoice: user.subscription
        });
        console.log('Ändrad prenumerationsstatus');
      }
    })
    .catch(err => {
      console.log(err);
      res.json('error');
    })
})


let adminUser = { // Om tid finns, lägg in i en json fil
  userName: 'admin',
  userPassword: 'test'
};

router.post('/adminlogin', function (req, res, next) {

  if (adminUser.userName == req.body.userName && adminUser.userPassword == req.body.password) {
    console.log('success');
    res.redirect('/users');

  } else {
    res.send('Fel användaruppgifter inmatade');
  }
});

router.get('/', function (req, res, next) {

  User.find({}, 'userName subscription', (err, data) => {

    if (err) {
      console.log(err);
    } else {

      console.log(data);

      let printUsers = `<div><h2>Registerade användare</h2>`

      for (user in data) {
        printUsers += `<div>${data[user].userName} || ${data[user].subscription}</div>`
      }

      printUsers += `</div>`


      res.send(printUsers);
    }
  })
})



module.exports = router;
