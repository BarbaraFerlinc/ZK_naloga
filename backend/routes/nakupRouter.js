const express = require('express');
const router = express.Router();
const nakupController = require('../controllers/nakupController');
const knex = require('../knexConfig');


router.post('/dodaj', nakupController.dodajNakup);

module.exports = router;