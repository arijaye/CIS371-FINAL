/**
 * JournalAPI
 *
 * An API for storing journal entries along with
 * location data, mood data, and weather data.
 *
 * This file handles all the journal entry information routes,
 * and should enable our users to create update, get, and delete
 * their entries.
 *
 * CIS 371 - Fall 2021
 *
 */

/**********
 * Load all the libraries we need.
 **********/
// const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();
var user = require('./users.js');
var checkAuth = user.checkAuth;

/**
 * Create the schemas we will need.
 * Point is just a GEOJson lat/long coordinate.
 * Entry is a journal entry.
 */

// Pull in the mongoose library
const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointSchema = new Schema({
	type: {
		type: String,
		enum: ['Point'],
		required: true
	},
	coordinates: {
		type: [Number],
		required: true
	}
});

const entrySchema = new Schema({
	userId: mongoose.ObjectId,
        date: {
		type: Date,
		default: Date.now
	},
	mood: {
		type: String,
		required: true
	},
	entry: {
		type: String,
		required: true
	},
	location: {
		type: pointSchema,
		required: true
	},
	weather: String
});

// Really don't need the one for Point, but eh...
const Point = mongoose.model('Point', pointSchema);
const Entry = mongoose.model('Entry', entrySchema);

/* GET full entry listing for logged in user. */
router.get('/', async function(req, res, next) {
	if(!req.isAuthenticated()){
		res.render('message', {h1 : "Not authorized!"})
	} else {
		var entries = await Entry.find({ userId: req.user._id });
		res.render('journal', { entries : entries })
	}
});

/**
 * Get single entry for logged in user
 */
router.get('/:entryId', async function(req, res, next){
	var entry = await Entry.findOne({
		_id : req.params.entryId
	});
	if(entry.userId == req.user._id || req.user.admin == true){
		res.render('journal', {entries : entry});
	} else {
		res.render('message', {h1: "Not authorized!"})
		return;
	}
});

/**
 * Allow logged in user to create new entry.
 */
router.post('/postEntry', async function(req, res, next){
	if(!(req.body.entry && req.body.mood)){
		res.render('message', {h1: "Please add an entry AND a mood!"})
		return;
	} else {
		var entry = new Entry({
			userId: req.user._id,
			entry: req.body.entry,
			mood: req.body.mood,
			location: {
				"type" : "Point",
				"coordinates" : [req.body.latitude, req.body.longitude]
			},
			weather: req.body.weather
		});

		entry.save();
		var entries = await Entry.find({ userId: req.user._id });
		res.render('message', { h1 : "Note posted!" });
	}
});

/**
 * Allow a user to modify their own entry.
 */
router.post('/editEntry', async function(req, res, next){
    if(!(req.body.entry && req.body.mood)){
		console.log(req.body);
		res.render('message', {h1 : 'Missing required information.'})
		return;
    }

    const entry = await Entry.findOne({
		userId : req.user._id,
		_id : req.body.entryID
	});
    
	console.log(entry);

	if(entry){
		entry.entry = req.body.entry;
		entry.mood = req.body.mood;
		entry.location = {
            "type" : "Point",
            "coordinates" : [req.body.latitude, req.body.longitude]
        }
		entry.weather = req.body.weather;
		entry.save();
		res.render('message', { h1 : "Entry updated!" });
	} else {
		res.render('message', {h1 : 'Entry not found.'})
		return;
	}
});

/**
 * Allow a user to delete one of their own entries.
 */
router.post('/deleteEntry', async function(req, res,next){
    console.log(req.body);
	const entry = await Entry.findOneAndDelete({
		userId : req.user._id,
		_id : req.body.entryID
	});

	if(!entry){
		res.render('message', {h1 : 'Entry not found.'})
		return;
	}

	var entries = await Entry.find({ userId: req.user._id });
	res.render('message', {h1 : 'Entry deleted!'});
});

module.exports = { router, Entry };
