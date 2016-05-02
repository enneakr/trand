var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var dbClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;
var dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/trand'

var request = require('request');
var _ = require('underscore');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

router.use(bodyParser.json());
router.use(cookieParser());

router.get('/', function (req, res) {
  dbClient.connect(dbUrl, function (err, db) {
    if (!err) {
      var combinations = db.collection('combinations');
      combinations.find({email: req.currentUser.email}).toArray(function (err, results) {
        if (results.length>0) {
          res.json(results);
          db.close();
        } else {
          res.sendStatus(404);
          db.close();
        }
      })
    } else {
      res.sendStatus(404);
    }
  });
})

router.post('/new', function (req, res) {
  var newComb = {
    email: req.currentUser.email,
    information: req.body.information,
    combinations: req.body.combinations,
    date: new Date(),
  }
  dbClient.connect(dbUrl, function (err, db) {
    if (!err) {
      var combinations = db.collection('combinations');
      if (typeof(req.body.information._id)==='undefined') {
        combinations.insert(newComb, function (err, results) {
          res.status(201).send(results.ops[0]._id);
          db.close();
        })
      } else {
        combinations.update({_id: ObjectId(req.body.information._id)}, {
          $set: {
            information: req.body.information,
            combinations: req.body.combinations,
            date: new Date(),
          }
        }, function (err, results) {
          res.sendStatus(200);
          db.close();
        })
      }
    } else {
      res.sendStatus(404);
    }
  })
})

router.post('/update', function (req, res) {
  var updateComb = {
    _id: req.body.id,
    combinations: req.body.combinations,
  }
  dbClient.connect(dbUrl, function (err, db) {
    if (!err) {
      var combinations = db.collection('combinations');
      combinations.update({_id: {id: req.body.id }}, {
        $set: {
          combinations: req.body.combinations,
          date: new Date(),
        }
      }, {
          upsert: true,
        }, function (err, results) {
        res.sendStatus(200);
        db.close();
      })
    } else {
      res.sendStatus(404);
    }
  })
})
router.delete('/remove/:id', function (req, res) {
  dbClient.connect(dbUrl, function (err, db) {
    if (!err) {
      var combinations = db.collection('combinations');
      combinations.remove({_id: req.params.id }, function (err, result) {
        res.sendStatus(200);
        db.close;
      });
    } else {
      res.sendStatus(404);
    }
  })
});
router.delete('/remove-null/', function (req, res) {
  dbClient.connect(dbUrl, function (err, db) {
    if (!err) {
      var combinations = db.collection('combinations');
      combinations.remove({email: null }, function (err, result) {
        res.sendStatus(200);
        db.close;
      });
    } else {
      res.sendStatus(404);
    }
  })
});

module.exports = router;
