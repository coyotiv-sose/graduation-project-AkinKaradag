var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send([
    {name: 'John Doe'},
    {name: 'Jane Doe'},
    {name: 'John Smith'},
    {name: 'Jane Smith'}
  ]) 
});

/* Create a new user */
router.post('/', function(req, res, next){
  const user = new User(req.body.name)
  res.send(user)
})

module.exports = router;
