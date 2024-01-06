const express = require('express');
const router = express.Router();
const uporabnikController = require('../controllers/uporabnikController');

router.post('/dodaj', uporabnikController.dodajUporabnika);
router.get('/vsi', uporabnikController.vsiUporabniki);
router.get('/:id', uporabnikController.najdiUporabnika);
router.put('/:id', uporabnikController.posodobiUporabnika);
router.delete('/:id', uporabnikController.izbrisiUporabnika);
router.post('/prijavljen-uporabnik', uporabnikController.prijavljenUporabnik);
router.post('/prijavljen-profil', uporabnikController.prijavljenProfil);
router.post('/get-email-from-id', uporabnikController.getEmailFromId);
router.post('/get-email-from-oglas-id', uporabnikController.getEmailFromOglasId);

module.exports = router;
