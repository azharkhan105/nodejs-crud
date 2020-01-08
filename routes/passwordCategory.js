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
    getPassCat.exec((err, data)=>{
      if(err) throw err;
      res.render('password_category', { title: 'Password Management System', msg:'', loginUser:loginUser,records:data });
    });
  });
  
  router.get('/delete/:id',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passCat_id = req.params.id;
  
    var passCatDelete = passCatModel.findByIdAndDelete(passCat_id);
    //console.log(passCat_id);
    passCatDelete.exec((err)=>{
      if(err) throw err;
      res.redirect('/passwordCategory');
    });
  });
  
  router.get('/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passCat_id = req.params.id;
    var passCatEdit = passCatModel.findById(passCat_id);
    //console.log(passCat_id);
    passCatEdit.exec((err, data)=>{
      if(err) throw err;
      res.render('edit_pass_category', { title: 'Password Management System', msg:'', loginUser:loginUser, errors:'', success:'',records:data });
    });
  });
  
  router.post('/edit',checkLoginUser,[
    check('passwordCategory', 'Enter Password Category Name').trim().isLength({min:1})
  ], function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passCat_id = req.body.cat_id;
    var passwordCategory = req.body.passwordCategory;
    var passCatEdit = passCatModel.findById(passCat_id);
    //console.log(passCat_id);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      passCatEdit.exec((err, data)=>{
        if(err) throw err;
        res.render('edit_pass_category', { title: 'Password Management System', msg:'', loginUser:loginUser, errors:errors.mapped(), success:'',records:data });
      });
  
    }else{
      var updatePassCat = passCatModel.findByIdAndUpdate(passCat_id,{
        password_category:passwordCategory
      });
      updatePassCat.exec((err)=>{
        if(err) throw err;
        res.redirect('/passwordCategory');
      });
    }
});

module.exports= router;
  