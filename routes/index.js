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



router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('/dashboard');
  }else{
    res.render('index', { title: 'Password Management System', msg:'' });
  }
  
});

router.post('/', function(req, res, next) {
  var uname = req.body.uname;
  var password = req.body.password;
  var checkUser = userModule.findOne({username:uname});
  checkUser.exec((err, data)=>{
    if(err) throw err;
    if(data){
      var getUserID = data._id;
      var getPassword = data.password;
      if(bcrypt.compareSync(password, getPassword)){
        var token = jwt.sign({userId:getUserID}, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', uname);
        res.redirect('/dashboard');
      }else{
        res.render('index', { title: 'Password Management System', msg:'Invalid Username or Password.' });
      }
    }else{
      res.render('index', { title: 'Password Management System', msg:'User Not Found.' });
    }
   });
});

router.get('/signup', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('/dashboard');
  }else{
    res.render('signup', { title: 'Password Management System', msg:'' });
  }
});

router.post('/signup', checkUsername,checkEmail, function(req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var cpassword = req.body.cpassword;
  if(cpassword != password){
    res.render('signup', { title: 'Password Management System', msg:'Password not matched!' });
  }else{
    password = bcrypt.hashSync(password,10);
    var userDetails = new userModule({
      username:username,
      email:email,
      password:password,
    });
  
    userDetails.save((err, doc)=>{
      if(err) throw err;
      res.render('signup', { title: 'Password Management System', msg:'User Register Successfully!' });
    });
  }
});

/*router.get('/view-all-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var options = {
    offset:1,
    limit:2
  };
  passModel.paginate({}, options).then(function(result){
    res.render('view-all-password', { title: 'Password Management System',
     msg:'',
    loginUser:loginUser, 
    records:result.docs,current:result.offset,pages:Math.ceil(result.total/result.limit) });
  });
});*/





/*
router.get('/view-all-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var perPage = 2;
  var page = 1;
  getAllPassDetails.skip(( perPage * page)-perPage).limit(perPage).exec((err, data)=>{
    if(err) throw err;
    passModel.countDocuments({}).exec((err,count)=>{
      res.render('view-all-password', { title: 'Password Management System', msg:'', loginUser:loginUser, records:data,current:page,pages:Math.ceil(count/perPage) });
    });
  });
});

router.get('/view-all-password/:page',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var perPage = 2;
  var page = req.params.page || 1;
  getAllPassDetails.skip(( perPage * page)-perPage).limit(perPage).exec((err, data)=>{
    if(err) throw err;
    passModel.countDocuments({}).exec((err,count)=>{
      res.render('view-all-password', { title: 'Password Management System', msg:'', loginUser:loginUser, records:data,current:page,pages:Math.ceil(count/perPage) });
    });
  });
});*/


router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});




module.exports = router;
