var express = require('express');
var router = express.Router();

const nodemailer = require('nodemailer');
const userLogin = require('../models/userModel')
const expenseModel = require('../models/expenseModel');
const passport = require('passport');
const passportLocal = require('passport-local');
const gmailCred = require('../gmailCred');

passport.use(new passportLocal(userLogin.authenticate()));


/* GET home page. */
router.get('/',isLoggedIn, function(req, res, next) {

  res.render('index',{navCheck:'home'});
});
router.get('/list',isLoggedIn,async function(req, res, next) {
try {
  let userExp = []
  const expense = await expenseModel.find();
  expense.forEach(function(exp){
    if (exp.user.toString() === req.user.id) {
      userExp.push(exp)
    } else {
      
    }
  })
  res.render('list',{navCheck:'list', userExp:userExp});
} catch (error) {
  console.log(error)
}
});




// create expense 
router.get('/create', isLoggedIn, async function(req, res, next){
  const categoryList = [
    "Groceries",
    "Utilities (Electricity, Water, Gas)",
    "Rent/Mortgage",
    "Transportation (Fuel, Public Transport)",
    "Healthcare/Medical Expenses",
    "Insurance (Health, Car, Home)",
    "Entertainment",
    "Dining Out",
    "Shopping",
    "Personal Care (Toiletries, Cosmetics)",
    "Education",
    "Technology (Internet, Phone, Software)",
    "Travel",
    "Gifts/Donations",
    "Pets",
    "Home Maintenance",
    "Savings/Investments",
    "Debt Payments",
    "Miscellaneous"
  ];
  res.render('create', {navCheck:'create', categoryList:categoryList})
});

router.post('/create', isLoggedIn, async function(req, res, next){
  try {
    const expense = await expenseModel(req.body);
    req.user.expenses.push(expense._id);
    expense.user = req.user._id
    await expense.save();
    await req.user.save();
    res.redirect('/list')
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

router.get('/delete/:id', isLoggedIn,async function(req, res){
  try {
    const expensesIndex = await req.user.expenses.findIndex((exp)=>exp._id.toString() === req.params.id);
    req.user.expenses.splice(expensesIndex, 1);
    await req.user.save();

    await expenseModel.findByIdAndDelete(req.params.id);
    res.redirect('/list')
  } catch (error) {
    
  }
})

router.get('/update/:id', isLoggedIn, async function(req, res){
  const expenseData = await expenseModel.findById(req.params.id);
  const categoryList = [
    "Groceries",
    "Utilities (Electricity, Water, Gas)",
    "Rent/Mortgage",
    "Transportation (Fuel, Public Transport)",
    "Healthcare/Medical Expenses",
    "Insurance (Health, Car, Home)",
    "Entertainment",
    "Dining Out",
    "Shopping",
    "Personal Care (Toiletries, Cosmetics)",
    "Education",
    "Technology (Internet, Phone, Software)",
    "Travel",
    "Gifts/Donations",
    "Pets",
    "Home Maintenance",
    "Savings/Investments",
    "Debt Payments",
    "Miscellaneous"
  ];
  res.render('updateExp', {navCheck:'list', expenseData:expenseData, categoryList:categoryList})
})

router.post('/update/:id', isLoggedIn,async function(req, res){
  try {
    const updateExp = await expenseModel.findByIdAndUpdate(req.params.id,{
      title:req.body.title,
      amount: req.body.amount,
  category: req.body.category,
  description: req.body.description,
  user:req.user._id
})
    await updateExp.save();
    res.redirect('/list')
  } catch (error) {
    console.log(error)
    res.send(error.toString())
  }
})



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

router.post('/newpass/:email', async function(req, res){
  try {
    const userF = await userLogin.findOne({email:req.params.email});
    await userF.setPassword(req.body.password, function(err, info){
      if(err){
        console.log(err)
        res.json(err)
      } else{
        req.flash('sr','Password Updated Successfully')
        res.redirect("/login")
      }
    });
    userF.genratedOtp = -1;
    await userF.save();
  } catch (error) {
    console.log('set pass new', error);
    res.json(error)
  }
})

async function sendOtpFunction(email, otp, res){
  const transport = nodemailer.createTransport({
    service:'gmail',
    host:'smpt.gmail.com',
    port:465,
    auth:{
      user:gmailCred.gmail,
      pass:gmailCred.pass
    }
  })
  const mailOptions = {
    from:`Telegram Clone <${gmailCred.gmail}>`,
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



// profile page
router.get('/profile',isLoggedIn, function(req, res, next){

  res.render('profile',{navCheck:'login', user:req.user})
})


// is logged in middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect('/login')
  }
}

module.exports = router;
