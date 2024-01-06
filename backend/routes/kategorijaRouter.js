const express = require('express');
const router = express.Router();
const kategorijaController = require('../controllers/kategorijaController');


router.get('/vsi', kategorijaController.vseKategorije);

module.exports = router;

