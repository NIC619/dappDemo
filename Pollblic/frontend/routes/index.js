var fs = require('fs');
var mongoose = require('mongoose');
var pollRecords = mongoose.model('pollRecord');
var express = require('express');
var router = express.Router();
var Web3 = require('Web3');
var web3 = new Web3();

/* web3 set up */
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var indexContractAddr = '';
var indexContractABI = JSON.parse( fs.readFileSync('../backend/compile/Index.abi', 'utf-8') );

const _title = 'Pollblic';
var account;
web3.eth.getAccounts(function(err, accounts) {
	account = accounts[0];
});

/* DEVELOPEMENT FUNCTIONS */
router.get('/delete', function(req, res) {
	pollRecords.find().remove().exec();
	res.render('index', {title: _title, pollRecordList: []});
});
/*                       */




/* GET home page */
router.get('/', function(req, res) {
	pollRecords.find(function(err, _pollRecordList) {
		// web3.eth.getAccounts(function(err, _accounts){
		// 	console.log(_accounts);
		// });
		res.render('index', {title: _title, pollRecordList: _pollRecordList});
	});
});

/* GET specific poll */
router.get('/poll', function(req, res) {
	pollRecords.findOne({ id : req.query.id }, function(err, _pollRecord) {
		res.render('thePoll', {title: _title, pollRecord: _pollRecord});
	});
})
/*                   */

/* create new poll */
router.get('/newPoll', function(req, res) {
	res.render('newPoll', {title: _title})
});
router.post('/newPoll', function(req, res) {
	var newPollRecord = new pollRecords();
	//console.log(req.body.name);
	var computedID = web3.sha3(req.body.title + account + Math.floor((new Date).getTime()/1000) );
	// console.log("'" + req.body.title + account + Math.floor((new Date).getTime()/1000) + "' is hashed into " + computedID);
	
	pollRecords.find({ id: computedID }, function(err, pollRecordList){
		if( pollRecordList !== undefined ) {
			res.send("Poll already registered")
			return;
		}
	});
	
	newPollRecord.ifOpen = true;
	newPollRecord.id = computedID;
	newPollRecord.title = req.body.title;
	newPollRecord.duration = req.body.duration * 60 * 60 * 24;
	newPollRecord.address = '0x0000000000000000012300000000000000000456';	// newPollRecord.address = req.body.address;
	newPollRecord.owner = account;	// newPollRecord.owner = req.body.owner;
	newPollRecord.price = req.body.price;
	newPollRecord.totalNeeded = req.body.totalNeeded;
	newPollRecord.numberOfQuestion = req.body.numberOfQuestion;
	newPollRecord.paymentLockTime = req.body.paymentLockTime * 60;
	newPollRecord.ifEncrypt = req.body.ifEncrypt == "yes";
	if( req.body.ifEncrypt ) newPollRecord.encryptionKey = req.body.encryptionKey;
	newPollRecord.save();
	res.send("Success");
});
/*                  */

/* GET specific question */
router.get('/question', function(req, res) {
	// console.log(req.query.pollID);
	// console.log(req.query.pollAddress);
	// console.log(req.query.questionNumber);
	if(req.query.questionNumber == 1) res.send({ type: 'single', body: 'choose', numberOfAnswer: 3, answer: [ "a1", "a2", "a3" ]});
	else if(req.query.questionNumber == 2) res.send({ type: 'multi', body: 'choose', numberOfAnswer: 3, answer: [ "b1", "b2", "b3" ]});
	else res.send({ type: 'short', body: 'how are you', numberOfAnswer: 0, answer: []});
});
/*                       */

/* submit new answer */
router.post('/newAnswer', function(req, res) {
	res.send("QType: " + req.body.type + ", answer: " + req.body.answer + " received.");
})
/*                   */

/* Interaction with poll */
router.post('/newInteraction', function (req, res) {
	res.send('Poll address: ' + req.body.address + ', actionType: ' + req.body.action);
});
/*                       */

router.get('/search', function(req, res) {
	if( req.query.title && req.query.owner ) {
		pollRecords.find({ title: req.query.title , owner: req.query.owner }, function( err, searchResults ) {
			if( searchResults === undefined ) {
				res.render( 'search', { title: 'Pollblic', pollRecordList: [] });
			}
			else {
				res.render( 'search', { title: 'Pollblic', pollRecordList: searchResults });
			}
		});
	}
	else if( req.query.title ) {
		pollRecords.find({ title: req.query.title }, function( err, searchResults ) {
			if( searchResults === undefined ) {
				res.render( 'search', { title: 'Pollblic', pollRecordList: [] });
			}
			else {
				res.render( 'search', { title: 'Pollblic', pollRecordList: searchResults });
			}
		});
	}
	else if( req.query.owner ) {
		pollRecords.find({ owner: req.query.owner }, function( err, searchResults ) {
			if( searchResults === undefined ) {
				res.render( 'search', { title: 'Pollblic', pollRecordList: [] });
			}
			else {
				res.render( 'search', { title: 'Pollblic', pollRecordList: searchResults });
			}
		});
	}
	else {
		if( req.query.user ) {
			res.render('search', {title: 'Pollblic', pollRecordList: []});
		}
		else
			res.render( 'search', { title: 'Pollblic', pollRecordList: [] });
	}
});

router.get('/reportRecords', function(req, res) {
	reportRecords.find(function(err, _reportRecordList){
		// console.log(_reportRecordList);
		res.render('layoutReportRecord', {title: 'OverHere', reportRecordList: _reportRecordList});
	});
});




module.exports = router;
