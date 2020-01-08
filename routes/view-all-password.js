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
    var loginUser=localStorage.getItem('loginUser');
    var options = {
      offset : 1, 
      limit  : 2
    };
    passModel.paginate({},options).then(function(result){
      //console.log(result);
      res.render('view-all-password', { title: 'Password Management System',
        msg:'',
        loginUser: loginUser,
        records: result.docs,
        current: result.offset,
        pages: Math.ceil(result.total / result.limit) 
      });
    });
  });
  
  router.get('/:page',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var perPage = 2;
    var page = req.params.page || 1;
    getAllPassDetails.skip(( perPage * page)-perPage).limit(perPage).exec((err, data)=>{
      if(err) throw err;
      passModel.countDocuments({}).exec((err,count)=>{
        res.render('view-all-password', { title: 'Password Management System', msg:'', loginUser:loginUser, records:data,current:page,pages:Math.ceil(count/perPage) });
      });
    });
  });

module.exports= router;
  