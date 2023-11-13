var express = require('express');
var router = express.Router();

const nodemailer = require('nodemailer');
const userLogin = require('../models/userModel')
const categoryModel = require('../models/categoryModel')
const expenseModel = require('../models/expenseModel');
const passport = require('passport');
const passportLocal = require('passport-local');

passport.use(new passportLocal(userLogin.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',{navCheck:'home'});
});


// all login realated routes
router.get('/login', function(req, res, next) {
  let rs = ""
  req.flash('sr').forEach(function(msg){
    rs= msg
  });
  let loginCheck = req.session.messages;
  req.session.messages = null;
  res.render('login',{navCheck:'login', loginCheck:loginCheck, rs:rs});
});

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/login',
  failureMessage:true
}) ,function(req, res, next) {

  res.render('login',{navCheck:'login'});
});

router.get('/register', function(req, res, next) {
  res.render('register',{navCheck:'login'});
});

router.post('/register',async function(req, res, next) {
  try {
    userLogin.register({
      username:req.body.username,
      email:req.body.email
    }, req.body.password);
    req.flash('sr', "Successfully registred now you can login")
    res.redirect('/login')
  } catch (error) {
    console.log(error)
    res.json(error)
  }
});

router.get('/forgot', function(req, res, next) {
  let nf = ''
   req.flash('nf').forEach(function(msg){
    nf=msg
  })
  res.render('forgot',{navCheck:'login', nf:nf});
});

router.post('/forgot',async function(req, res, next) {

  try {
    const userF = await userLogin.findOne({email:req.body.email});
    if(!userF){
      req.flash('nf', 'Email is not Register');
      res.redirect('/forgot');
    } else{
      const otp = Math.floor(1000 + Math.random()*9000);
      userF.genratedOtp = otp;
      sendOtpFunction(userF.email, otp, res)
      .then(async ()=>{
        await userF.save()
        res.render('otp',{navCheck:'login',wo:'', userMail:userF.email})
      })
      .catch((error)=>{
        console.log('mail error 1', error);
        res.json(error)
      })
    }
  } catch (error) {
    console.log('otp error 2' ,error);
    res.json(error)
  }
});

router.post('/otp/:email', async function(req, res, next){
  try {
    const userF = await userLogin.findOne({email:req.params.email})
    if(!userF){
      req.flash('nf', 'Email is not Register');
      res.redirect('/forgot');
    } else {
      if(userF.genratedOtp === +req.body.otp){
        userF.genratedOtp = -1;
        await userF.save();
        res.render('newPass',{navCheck:'login',userMail:userF.email})
      } else{
        res.render('otp',{navCheck:'login', wo:'Enter correct OTP.',userMail:userF.email})
      }
    }
  } catch (error) {
    console.log('otp check error 1', error);
    res.json(error);
  }
})

async function sendOtpFunction(email, otp, res){
  const transport = nodemailer.createTransport({
    service:'gmail',
    host:'smpt.gmail.com',
    port:465,
    auth:{
      user:"ajayindiandev@gmail.com",
      pass:"xfvk ulcj hpwc uxkq"
    }
  })
  const mailOptions = {
    from:'Telegram Clone <ajayindiandev@gmail.com>',
    to:email,
    subject:'Reset password OTP',
    html:`<h1>Your OTP is:- ${otp}</h1>`
  };
  transport.sendMail(mailOptions, (error, info)=>{
    if(error){
      console.log('mail inner error 3',error),
      res.json(error)
    } else {
      // console.log(info)
      return;
    }
  })
}




// is logged in middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect('/login')
  }
}

module.exports = router;
