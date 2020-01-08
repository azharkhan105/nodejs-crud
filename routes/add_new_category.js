var express = require('express');
var userModule = require('../modules/user');
var passCatModel = require('../modules/password_category');
var passModel = require('../modules/add_password');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const {matchedData, sanitizeBody } = require('express-validator');
var router = express.Router();
var getPassCat = passCatModel.find({});
var getAllPassDetails = passModel.find({});

/* Check Login */
function checkLoginUser(req, res, next){
  var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

/* GET home page. */
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

/*Check Username Exits*/
function checkUsername(req, res, next){
  var uname = req.body.uname;
  var checkUsernameexits = userModule.findOne({username:uname});
  checkUsernameexits.exec((err, data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', { title: 'Password Management System', msg:'Username Already Exit' });
    }
    next();
  });
}


/*Check Email Exits*/

function checkEmail(req, res, next){
  var email = req.body.email;
  var checkexitEmail = userModule.findOne({email:email});
  checkexitEmail.exec((err, data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', { title: 'Password Management System', msg:'Email Already Exit' });
    }
    next();
  });
}

router.get('/',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  res.render('addNewCategory', { title: 'Password Management System', msg:'', loginUser:loginUser, errors:'', success:'' });
});

router.post('/',checkLoginUser,[
  check('passwordCategory', 'Enter Password Category Name').trim().isLength({min:1})
], function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('addNewCategory', { title: 'Password Management System', msg:'', loginUser:loginUser, errors:errors.mapped(), success:'' });
  }else{
    var passCateName = req.body.passwordCategory;
    var passDetails = new passCatModel({
      password_category:passCateName
    });

    passDetails.save((err, doc)=>{
      if(err) throw err;
      res.render('addNewCategory', { title: 'Password Management System', msg:'', loginUser:loginUser, errors:'', success:'Password Category Added Successfully!' });
    });
  }
});
module.exports = router;
