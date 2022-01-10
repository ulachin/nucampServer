const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');


const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    Favorite.find({ user: req.user._id })
        .populate('user')
        .populate('campsites')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch((err) => next(err));
    // res.end('Will send all the partners to you');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                Favorite.create({ user: req.user._id, campsites: req.body }).then((favorite) => {
                    res.statusCode = 200;
                    res.json(favorite);
                });
            }
            req.body.map((favey) => {
                if (!favorite.campsites.includes(favey._id)) {
                    favorite.campsites.push(favey);
                }
            });
            favorite.save().then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
                console.log('Favorite Created ', favorite);
            });
        })
        .catch((err) => next(err));
    // res.end(`Will add the partner: ${req.body.name} with description: ${req.body.description}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete()
        .then((response) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch((err) => next(err));
    // res.end('Deleting all partners');
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) =>
    res.sendStatus(403, 'GET not supported on /favorites/:campsiteId')
)
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                Favorite.create({
                    user: req.user._id,
                    campsites: [ { _id: req.params.campsiteId } ]
                }).then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            } else if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save().then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            } else {
                res.send('Campsite already favorited');
            }
        })
        .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                res.end('You have no favorites to delete');
            }
            const campsites = favorite.campsites.filter((favorite) => !favorite.equals(req.params.campsiteId));
            favorite.campsites = campsites;
            favorite.save().then((favorite) => {
                res.json(favorite);
            });
        })
        .catch((err) => next(err));
    // res.end('Deleting all partners');
});

module.exports = favoriteRouter;