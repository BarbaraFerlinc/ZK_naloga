const express = require('express');
const router = express.Router();
const artikelController = require('../controllers/artikelController');
var multer = require('multer');
var path = require('path');
const maxSize = 30 * 1024 * 1024; // 1 MB

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

var upload = multer({
    storage: storage,
    limits: {
        fileSize: maxSize // omejitev velikosti datoteke na 2MB
    }
});

router.post('/dodaj', upload.array('files'), artikelController.dodajArtikel);

module.exports = router;