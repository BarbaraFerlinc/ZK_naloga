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

var upload = multer({ storage: storage });

router.post('/dodaj', upload.array('slika'), async (req, res) => {
    const { naslov, velikost, opis, jePotrjen, potrjenaZamenjava, fk_oglas_id, fk_uporabnik_id, fk_kategorija_id } = req.body;

    if (!naslov || !velikost || !opis) {
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
    console.log(req.body)

    try {
        const novaZamenjava = await knex('zamenjani').insert({
            naslov: naslov,
            velikost: velikost,
            opis: opis,
            jePotrjen: jePotrjen,
            potrjenaZamenjava: potrjenaZamenjava,
            fk_oglas_id: fk_oglas_id,
            fk_uporabnik_id: fk_uporabnik_id,
            fk_kategorija_id: fk_kategorija_id
        });

        if (req.files) {
            console.log(req.files)
            console.log(novaZamenjava[0])
            for (let i = 0; i < req.files.length; i++) {
                console.log("sem pridem")
                await knex('slika_zamenjanih').insert({
                    pot: req.files[i].path,
                    fk_zamenjani_id: novaZamenjava[0]
                });
            }
        }

        res.status(200).json({ message: 'ok', zamenjani: novaZamenjava });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Napaka pri shranjevanju zamenjave' });
    }
});

router.get('/zamenjani/:fk_oglas_id', async (req, res) => {
    const { fk_oglas_id } = req.params;
    //dodaj še validacijo če ta id od oglasa ne obstaja
    if (!fk_oglas_id) {
        return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
    }
    try {
        const zamenjaniData = await knex('zamenjani')
            .join('oglas', 'zamenjani.fk_oglas_id', '=', 'oglas.id')
            .where('zamenjani.fk_oglas_id', fk_oglas_id)
            .select('zamenjani.*');

        if (zamenjaniData === undefined || zamenjaniData.length == 0) {
            return res.status(404).json({ error: 'Oglas ne obstaja' });
        }
        res.json(zamenjaniData);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/zamenjanii/:fk_uporabnik_id', async (req, res) => {
    const fk_uporabnik_id = req.params.fk_uporabnik_id;

    try {
        const results = await knex('zamenjani')
            .join('oglas', 'zamenjani.fk_oglas_id', '=', 'oglas.id')
            .join('uporabnik', 'zamenjani.fk_uporabnik_id', '=', 'uporabnik.id')
            .where('oglas.fk_uporabnik_id', fk_uporabnik_id)
            .select('zamenjani.*', 'uporabnik.ime', 'uporabnik.priimek', 'oglas.naslov as naslov_oglasa');

            console.log(results)
        res.json(results);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

router.get('/vsi', async (req, res) => {
    try {
        const zamenjani = await knex('zamenjani')
            .select('zamenjani.*', 'uporabnik.id as prodajalecID', 'uporabnik.ime', 'uporabnik.priimek')
            .join('uporabnik', 'zamenjani.fk_uporabnik_id', 'uporabnik.id');

        // Loop through each ad to get the images
        for (let i = 0; i < zamenjani.length; i++) {
            const slike = await knex('slika_zamenjanih')
                .select('pot')
                .where('fk_zamenjani_id', '=', zamenjani[i].id);

            // Add the images to the ad object
            zamenjani[i].slike = slike.map(slika => slika.pot);
        }
        res.status(200).json(zamenjani);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju oglasov iz baze', details: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const zamenjani = await knex('zamenjani').select('*').where('id', id).first();

        if (!zamenjani) {
            return res.status(404).json({ error: 'Zamenjani ne obstaja' });
        }
        const slike = await knex('slika_zamenjanih')
            .select('pot')
            .where('fk_zamenjani_id', '=', id);

        // Add the images to the ad object
        zamenjani.slike = slike.map(slika => slika.pot);
        const uporabnik = await knex('uporabnik')
            .select('*')
            .where('id', '=', zamenjani.fk_uporabnik_id)
            .first();

        if (!uporabnik) {
            return res.status(404).json({ error: 'Uporabnik ne obstaja' });
        }

        // Add the user to the ad object
        zamenjani.uporabnik = uporabnik;
        res.status(200).json(zamenjani);
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju oglasa iz baze', details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const oglas = await knex('zamenjani').select('*').where('id', id);
        if (oglas.length === 0) {
            return res.status(404).json({ error: 'Oglas ne obstaja' });
        }
        await knex('zamenjani').where('id', id).del();
        res.status(200).json({ message: 'Oglas izbrisan' });
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri brisanju oglasa iz baze', details: error.message });
    }
});

router.post('/prestej-neprebrane', async (req, res) => {
    try {   
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'UserId manjka' });
        }

        const neprebranaObvestila = await knex('zamenjani')
            .join('oglas', 'zamenjani.fk_oglas_id', '=', 'oglas.id')
            .where(function () {
                this.where('oglas.fk_uporabnik_id', userId)
                    .andWhere('zamenjani.prebrano', false);
            })
            .count('zamenjani.prebrano as neprebranaObvestila');
        
        console.log(neprebranaObvestila);

        res.status(200).json(neprebranaObvestila);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju neprebranih obvestil', details: error.message });
    }
});

router.post('/preberi', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'UserId manjka' });
        }

        await knex('zamenjani')
            .join('oglas', 'zamenjani.fk_oglas_id', '=', 'oglas.id')
            .where(function () {
                this.where('oglas.fk_uporabnik_id', userId)

            })
            .update({ prebrano: true });

        res.status(200).json({ message: 'Obvestila označena kot prebrana' });
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri označevanju obvestil kot prebrana', details: error.message });
    }
});

module.exports = router;