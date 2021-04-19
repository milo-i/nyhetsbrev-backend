var express = require('express');
var router = express.Router();
const cors = require('cors');
router.use(cors());

/* GET users listing. */
router.get('/', function (req, res, next) {

  res.send('Hello users');


});



router.post('/new', function (req, res, next) {
  console.log(req.body);

  res.json('ny användare sparad');


});

module.exports = router;
