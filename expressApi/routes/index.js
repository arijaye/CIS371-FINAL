var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('./users.js').User;
var Entry = require('./entries.js').Entry;
var validPassword = require('./users.js').validPassword;

/********** ADDED DELETE LATER **********/
var pbkdf2 = require('pbkdf2');
var crypto = require('crypto'); 

passport.use(new LocalStrategy(
  function(username, password, done){ 
    User.findOne({username: username }, function(err, user){
      if(err) { return done(err); }
      if(!user) { return done(null, false); }
      if(!validPassword(password, user.salt, user.password)){ return done(null, false); }
      return done(null, user);
    }
   )
 }));

var checkAuthLocal = passport.authenticate('local', { failureRedirect: '/', session: true });

/* GET home page */
router.get('/', function(req, res, next) {
    var name;
  if(req.user) {
    var name = req.user.username;
  } 
  res.render('index', { title: 'MyJournal - Data Collection Device', name: name });
});

/* GET ABOUT PAGE */
router.get('/about', function(req, res, next){
  res.render('about', { title: 'About MyJournal'});
});

/* CHECK USERS INPUT AND DIRECT THEM TO HOME PAGE IF AUTHORIZED */
router.post('/login', checkAuthLocal, function(req, res, next){
  res.redirect('/');
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

/* IF USER IS NOT LOGGED IN, TAKE THEM TO HOME PAGE */
router.get('/user', function(req, res, next){
  if(!req.isAuthenticated())
    res.redirect('/');
	res.render('user');
});

/* !!!! PERFECT !!!! */
router.post('/addUser', function(req, res, next){
  res.redirect(307,'/users');
});

/* !!!! PERFECT !!!! */
router.post('/deleteUser', async function(req,res,next) {
  res.redirect(307,'/users/delete');
});

router.post('/updateUser', async function(req,res,next){
  console.log('HERE')
  res.redirect(307,'/users/updateUser');
});

/****************** ENTRIES ******************/

router.get('/journal', async function(req, res){
	if(!req.isAuthenticated()){
		res.redirect('/');
	} else {
    res.redirect('/entries');
	}
});

router.post('/postEntry', async function(req,res){
  console.log('POST')
	if(!req.isAuthenticated())
    res.redirect('/');
  console.log(req.body);
  res.redirect(307,'/entries/postEntry');
});

router.post('/editEntry', async function(req,res){
  console.log('EDIT')

	if(!req.isAuthenticated())
    res.redirect('/');
  console.log(req.body);
  res.redirect(307,'/entries/editEntry/' + req.body.entryID);
});

router.post('/deleteEntry', async function(req,res){
  console.log(req.body)

	if(!req.isAuthenticated())
    res.redirect('/');
  console.log(req.body);
  res.redirect(307,'/entries/deleteEntry/' + req.body.entryID);
});

module.exports = router;
