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



router.get('/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var getPassDetai = passModel.findById({_id:id});
    getPassDetai.exec((err, data)=>{
      if(err) throw err;
      getPassCat.exec((err, datacat)=>{
        res.render('edit_password_detail', { title: 'Password Management System', msg:'', loginUser:loginUser, recordCat:data,records:datacat, errors:'', success:'' });
      });
    });
  });
  
  router.post('/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var getPassDetai = passModel.findById({_id:id});
    
    passModel.findByIdAndUpdate(id,{
      password_category: req.body.pass_cat,
      project_name: req.body.project_name,
      password_detail: req.body.pass_details
    }).exec(function(err){
      if(err) throw err;
      getPassDetai.exec((err, data)=>{
        if(err) throw err;
        getPassCat.exec((err, datacat)=>{
          res.render('edit_password_detail', { title: 'Password Management System', msg:'', loginUser:loginUser, recordCat:data,records:datacat, errors:'', success:'Password Details Update Successfully!' });
        });
      });
    })
  });
  
  router.get('/delete/:id',checkLoginUser, function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var pass_id = req.params.id;
  
    var passDelete = passModel.findByIdAndDelete(pass_id);
    //console.log(passCat_id);
    passDelete.exec((err)=>{
      if(err) throw err;
      res.redirect('/view-all-password');
    });
  });
  
  router.get('/',checkLoginUser, function(req, res, next) {
    res.redirect('/dashboard');
  });

module.exports= router;
  