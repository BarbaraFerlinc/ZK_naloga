const knex = require('../knexConfig');
const Artikel = require('../models/artikel');
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

async function dodajArtikel(req, res) {
    const { naslov, velikost, opis, cena, lokacija, osebni_prevzem, za_zamenjavo, jeZamenjan, fk_uporabnik_id, fk_kategorija_id } = req.body;

    if (!naslov || !velikost || !opis || !cena || !lokacija || !osebni_prevzem || !za_zamenjavo) {
        return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
    }

    if (req.files.length > 5) {
        return res.status(400).json({ error: 'Lahko naložite največ 5 slik.' });
    }

    if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i].size > maxSize) {
                return res.status(400).json({ error: 'Vsaka slika mora biti manjša od 1MB' });
            }
        }
    }

    try {
        const novOglas = await Artikel.dodaj(naslov, velikost, opis, cena, lokacija, osebni_prevzem, za_zamenjavo, jeZamenjan, fk_uporabnik_id, fk_kategorija_id);
        if (req.files) {
            console.log(req.files)
            console.log(novOglas[0])
            for (let i = 0; i < req.files.length; i++) {
                console.log("sem pridem")
                await knex('slika').insert({
                    pot: req.files[i].path,
                    fk_oglas_id: novOglas[0]
                });
            }
        }
        res.status(200).json({ message: 'ok', oglas: novOglas });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Napaka pri shranjevanju oglasa' });
    }

}

module.exports = {
    dodajArtikel
};