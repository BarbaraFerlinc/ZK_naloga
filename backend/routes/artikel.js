var multer = require('multer');
var express = require('express');
var router = express.Router();
var knex = require('../knexConfig');
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

router.post('/dodaj', upload.array('slika'), async (req, res) => {
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
        const novOglas = await knex('oglas').insert({
            naslov: naslov,
            velikost: velikost,
            opis: opis,
            cena: cena,
            lokacija: lokacija,
            osebni_prevzem: osebni_prevzem,
            za_zamenjavo: za_zamenjavo,
            jeZamenjan: jeZamenjan,
            fk_uporabnik_id: fk_uporabnik_id,
            fk_kategorija_id: fk_kategorija_id
        });

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
});

router.get('/vsi', async (req, res) => {
    try {
        const oglasi = await knex('oglas')
            .select('oglas.*', 'kategorija.naziv as kategorijaNaziv', 'uporabnik.id as prodajalecID', 'uporabnik.ime', 'uporabnik.priimek')
            .join('kategorija', 'oglas.fk_kategorija_id', 'kategorija.id')
            .join('uporabnik', 'oglas.fk_uporabnik_id', 'uporabnik.id');

        // Loop through each ad to get the images
        for (let i = 0; i < oglasi.length; i++) {
            const slike = await knex('slika')
                .select('pot')
                .where('fk_oglas_id', '=', oglasi[i].id);

            // Add the images to the ad object
            oglasi[i].slike = slike.map(slika => slika.pot);
        }

        res.status(200).json(oglasi);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju oglasov iz baze', details: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const oglas = await knex('oglas').select('*').where('id', id).first();

        if (!oglas) {
            return res.status(404).json({ error: 'Oglas ne obstaja' });
        }
        const slike = await knex('slika')
            .select('pot')
            .where('fk_oglas_id', '=', id);

        // Add the images to the ad object
        oglas.slike = slike.map(slika => slika.pot);
        const uporabnik = await knex('uporabnik')
            .select('*')
            .where('id', '=', oglas.fk_uporabnik_id)
            .first();

        if (!uporabnik) {
            return res.status(404).json({ error: 'Uporabnik ne obstaja' });
        }
        if(oglas.jeZamenjan === 1){
            return res.status(404).json({ error: 'Oglas je že zamenjan' });
        }
        

        // Add the user to the ad object
        oglas.uporabnik = uporabnik;
        res.status(200).json(oglas);
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju oglasa iz baze', details: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const oglas = await knex('oglas').select('*').where('id', id);
        if (oglas.length === 0) {
            return res.status(404).json({ error: 'Oglas ne obstaja' });
        }
        await knex('oglas').where('id', id).del();
        res.status(200).json({ message: 'Oglas izbrisan' });
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri brisanju oglasa iz baze', details: error.message });
    }
});



router.put('/:id', upload.array('slika'), async (req, res) => {
    const { naslov, velikost, opis, cena, lokacija, za_zamenjavo, fk_uporabnik_id, fk_kategorija_id } = req.body;
    console.log(req.body)

    if (!naslov || !velikost || !opis || !cena || !lokacija || !za_zamenjavo) {
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
        const posodobiOglas = await knex('oglas').where({ id: req.params.id }).update({
            naslov: naslov,
            velikost: velikost,
            opis: opis,
            cena: cena,
            lokacija: lokacija,
            za_zamenjavo: za_zamenjavo,
            fk_uporabnik_id: fk_uporabnik_id,
            fk_kategorija_id: fk_kategorija_id
        });
        if (req.body.slikeNespremenjene === 'true') {
            console.log("slike nespremenjene")
            return res.status(200).json({ message: 'ok', oglas: posodobiOglas });
        }
        else {

            await knex('slika').where({ fk_oglas_id: req.params.id }).del();

            for (let i = 0; i < req.files.length; i++) {
                await knex('slika').insert({
                    pot: req.files[i].path,
                    fk_oglas_id: req.params.id
                });
            }
        }

        res.status(200).json({ message: 'ok', oglas: posodobiOglas });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Napaka pri posodabljanju oglasa' });
    }
});

router.get('/kategorija/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const oglas = await knex('oglas').select('*').where('fk_kategorija_id', id);
        if (oglas.length === 0) {
            return res.status(404).json({ error: 'Oglas s to kategorijo ne obstaja' });
        }
        res.status(200).json(oglas);
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju oglasa iz baze', details: error.message });
    }
});

router.get('/:id/slike', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID oglasa je obvezen' });
    }

    try {
        const slike = await knex('slika').where({ fk_oglas_id: id });

        if (!slike.length) {
            return res.status(404).json({ error: 'Za ta oglas ni najdenih slik' });
        }

        res.status(200).json({ slike });
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju slik' });
    }
});


router.get('/profil/:id', async (req, res) => {
    const prodajalec_id = req.params.id;

    try {
        const oglas = await knex('oglas')
            .select('*')
            .where('fk_uporabnik_id', prodajalec_id);
        res.status(200).json(oglas);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju oglasov' });
    }
});





module.exports = router;