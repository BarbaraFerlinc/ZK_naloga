var multer = require('multer');
var express = require('express');
var router = express.Router();
var knex = require('../knexConfig');
var path = require('path');

router.post('/dodaj', async (req, res) => {
    const { fk_oglas_id, fk_uporabnik_id, jeSprejeto, potrjenaZamenjava } = req.body;

    if (!fk_oglas_id || !fk_uporabnik_id || !jeSprejeto || !potrjenaZamenjava) {
        return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
    }



    try {

        const oglas = await knex('oglas').select('jeZamenjan').where('id', fk_oglas_id).first();
        if (oglas.jeZamenjan === 1) {
            return res.status(400).json({ error: 'Oglas ni več na voljo!' });
        }

        const obvestilo = await knex.transaction(async (trx) => {
            const currentDate = new Date()
            const insertedObvestilo = await trx('obvestilo_zamenjava').insert({
                fk_oglas_id: fk_oglas_id,
                fk_uporabnik_id: fk_uporabnik_id,
                jeSprejeto: jeSprejeto,
                datum: currentDate
            });

            await trx('oglas').where('id', fk_oglas_id).update('jeZamenjan', 1);
            await trx('zamenjani').where('fk_oglas_id', fk_oglas_id).update('jePotrjen', 1);
            await trx('zamenjani').where('id', potrjenaZamenjava).update('potrjenaZamenjava', 1);
            return insertedObvestilo;
        });

        res.status(200).json({ message: 'ok', obvestilo: obvestilo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Napaka pri shranjevanju zamenjave' });
    }

});

router.get('/vsi', async (req, res) => {
    try {
        const obvestilo_zamenjava = await knex('obvestilo_zamenjava').select('*');
        res.status(200).json(obvestilo_zamenjava);
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestil iz baze', details: error.message });
    }
});

router.post('/dodaj2', async (req, res) => {
    const { fk_oglas_id, fk_uporabnik_id, jeSprejeto } = req.body;

    if (!fk_oglas_id || !fk_uporabnik_id || !jeSprejeto) {
        return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
    }

    console.log(req.body);

    try {
        const obvestilo = await knex.transaction(async (trx) => {
            const currentDate = new Date()
            // Insert the new record into the 'obvestilo_zamenjava' table
            const insertedObvestilo = await trx('obvestilo_zamenjava').insert({
                fk_oglas_id: fk_oglas_id,
                fk_uporabnik_id: fk_uporabnik_id,
                jeSprejeto: jeSprejeto,
                datum: currentDate
            });

            return insertedObvestilo;
        });

        res.status(200).json({ message: 'ok', obvestilo: obvestilo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Napaka pri shranjevanju zamenjave' });
    }

});

router.get('/vsi', async (req, res) => {
    try {
        const obvestilo_zamenjava = await knex('obvestilo_zamenjava').select('*');
        res.status(200).json(obvestilo_zamenjava);
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestil iz baze', details: error.message });
    }
});

router.post('/getVsaObvestila-zaProdajalca', async (req, res) => {
    try {
        const { id } = req.body;
        const obvestila = await knex('obvestilo_zamenjava')
            .select('obvestilo_zamenjava.*', 'oglas.*', "uporabnik.ime", "uporabnik.priimek", 'obvestilo_zamenjava.id as idObvestila')
            .join('oglas', 'obvestilo_zamenjava.fk_oglas_id', 'oglas.id')
            .join('uporabnik', 'obvestilo_zamenjava.fk_uporabnik_id', 'uporabnik.id')
            .where('oglas.fk_uporabnik_id', id);


        console.log(obvestila)
        res.status(200).json(obvestila);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestil' });
    }
});

router.post('/getVsaObvestila-zaKupca', async (req, res) => {
    try {
        const { id } = req.body;
        const obvestila = await knex('obvestilo_zamenjava')
            .select('obvestilo_zamenjava.*', 'oglas.*', "uporabnik.ime as prodajalecIme", "uporabnik.priimek as prodajalecPriimek", 'obvestilo_zamenjava.id as idObvestila')
            .join('oglas', 'obvestilo_zamenjava.fk_oglas_id', 'oglas.id')
            .join('uporabnik', 'oglas.fk_uporabnik_id', 'uporabnik.id')
            .where('obvestilo_zamenjava.fk_uporabnik_id', id);

        res.status(200).json(obvestila);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestil' });
    }
});

router.post('/podrobnostiObvestila', async (req, res) => {
    const { id } = req.body;
    console.log(id + "toti sem")
    try {
        const obvestilo1 = await knex('obvestilo_zamenjava')
            .select('oglas.*', 'uporabnik.*', 'oglas.naslov as naslovOglasa', 'oglas.id as idOglasa')
            .join('oglas', 'obvestilo_zamenjava.fk_oglas_id', 'oglas.id')
            .join('uporabnik', 'oglas.fk_uporabnik_id', 'uporabnik.id')
            .where('obvestilo_zamenjava.id', id)
            .first();
        const slike = await knex('slika')
            .select('pot')
            .where('fk_oglas_id', '=', obvestilo1.idOglasa);
        obvestilo1.slike = slike.map(slika => slika.pot);

        if (!obvestilo1) {
            return res.status(404).json({ error: 'Obvestilo ne obstaja' });
        }
        const obvestilo2 = await knex('obvestilo_zamenjava')
            .select('uporabnik.ime', 'uporabnik.*', 'zamenjani.*', 'zamenjani.id as idZamenjanih')
            .join('zamenjani', 'obvestilo_zamenjava.fk_oglas_id', 'zamenjani.fk_oglas_id')
            .join('uporabnik', 'zamenjani.fk_uporabnik_id', 'uporabnik.id')
            .where('zamenjani.potrjenaZamenjava', 1)
            .where('obvestilo_zamenjava.id', id)
            .first();

        const slike2 = await knex('slika_zamenjanih')
            .select('pot')
            .where('fk_zamenjani_id', '=', obvestilo2.idZamenjanih);
        obvestilo2.slike = slike2.map(slika => slika.pot);

        if (!obvestilo2) {
            return res.status(404).json({ error: 'Obvestilo ne obstaja' });
        }

        console.log(obvestilo2)

        res.status(200).json({ obvestilo1, obvestilo2 });
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestila iz baze', details: error.message });
    }
});

router.post('/podrobnostiNakupa', async (req, res) => {
    const { id } = req.body;
    try {
        const obvestiloNakupa = await knex('obvestilo_nakupa')
            .select('oglas.*', 'oglas.naslov as naslovOglasa', 'oglas.id as idOglasa')
            .join('oglas', 'obvestilo_nakupa.fk_oglas_id', 'oglas.id')
            .where('obvestilo_nakupa.id', id)
            .first();

        const slike = await knex('slika')
            .select('pot')
            .where('fk_oglas_id', '=', obvestiloNakupa.id);
        obvestiloNakupa.slike = slike.map(slika => slika.pot);

        if (!obvestiloNakupa) {
            return res.status(404).json({ error: 'Obvestilo ne obstaja' });
        }

        res.status(200).json({ obvestiloNakupa });
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestila iz baze', details: error.message });
    }
});

router.post('/dodaj/obvestilo-nakupa', async (req, res) => {
    const { fk_oglas_id, fk_uporabnik_id } = req.body;
    console.log(req.body);
    if (!fk_oglas_id || !fk_uporabnik_id) {
        return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
    }

    try {
        const obvestilo = await knex.transaction(async (trx) => {
            const currentDate = new Date()
            // Insert the new record into the 'obvestilo_zamenjava' table
            const insertedObvestilo = await trx('obvestilo_nakupa').insert({
                fk_oglas_id: fk_oglas_id,
                fk_uporabnik_id: fk_uporabnik_id,
                datum: currentDate
            });

            if (!insertedObvestilo) {
                return res.status(400).json({ error: 'Napaka pri shranjevanju obvestila' });
            }

            return insertedObvestilo;
        });

        res.status(200).json({ message: 'ok', obvestilo: obvestilo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Napaka pri shranjevanju zamenjave' });
    }

});

router.post('/getVsaObvestilaNakupa-zaProdajalca', async (req, res) => {
    try {
        const { id } = req.body;
        const obvestila = await knex('obvestilo_nakupa')
            .select('obvestilo_nakupa.*', 'oglas.*', "uporabnik.ime", "uporabnik.priimek", 'obvestilo_nakupa.id as idObvestila')
            .join('oglas', 'obvestilo_nakupa.fk_oglas_id', 'oglas.id')
            .join('uporabnik', 'obvestilo_nakupa.fk_uporabnik_id', 'uporabnik.id')
            .where('oglas.fk_uporabnik_id', id);


        console.log(obvestila)
        res.status(200).json(obvestila);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestil' });
    }
});

router.post('/getVsaObvestilaNakupa-zaKupca', async (req, res) => {
    try {
        const { id } = req.body;
        const obvestila = await knex('obvestilo_nakupa')
            .select('obvestilo_nakupa.*', 'oglas.*', "uporabnik.ime as prodajalecIme", "uporabnik.priimek as prodajalecPriimek", 'obvestilo_nakupa.id as idObvestila')
            .join('oglas', 'obvestilo_nakupa.fk_oglas_id', 'oglas.id')
            .join('uporabnik', 'oglas.fk_uporabnik_id', 'uporabnik.id')
            .where('obvestilo_nakupa.fk_uporabnik_id', id);

        res.status(200).json(obvestila);
    } catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju obvestil' });
    }
});

router.post('/preberiNakup', async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.body.userId;

        if (!id || !userId) {
            return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
        }

        const obvestilo = await knex('obvestilo_nakupa')
            .where('id', id)
            .first();

        if (!obvestilo) {
            return res.status(404).json({ error: 'Obvestilo ne obstaja' });
        }

        const oglas = await knex('oglas')
            .where('id', obvestilo.fk_oglas_id)
            .first();

        if (!oglas) {
            return res.status(404).json({ error: 'Oglas ne obstaja' });
        }

        let updateObj = {};

        if (obvestilo.fk_uporabnik_id === userId) {
            updateObj.prebrano_kupec = true;
        }
        else if (oglas.fk_uporabnik_id === userId) {
            updateObj.prebrano_prodajalec = true;
        }
        else {
            return res.status(400).json({ error: 'Uporabnik nima pravic za označitev obvestila kot prebrano' });
        }

        await knex('obvestilo_nakupa')
            .where('id', id)
            .update(updateObj);

        res.status(200).json({ message: 'Obvestilo je prebrano' });
    } catch (error) {
        console.error('Napaka pri označevanju vseh obvestil kot prebrana', error);
        res.status(500).json({ error: 'Napaka pri označevanju vseh obvestil kot prebrana' });
    }
});

router.post('/prestej-neprebraneNakup', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'UserId manjka' });
        }

        const neprebranaObvestila = await knex('obvestilo_nakupa')
            .join('oglas', 'obvestilo_nakupa.fk_oglas_id', '=', 'oglas.id')
            .where(function () {
                this.where('oglas.fk_uporabnik_id', userId)
                    .andWhere('obvestilo_nakupa.prebrano_prodajalec', false);
            })
            .orWhere(function () {
                this.where('obvestilo_nakupa.fk_uporabnik_id', userId)
                    .andWhere('obvestilo_nakupa.prebrano_kupec', false);
            })
            .count('obvestilo_nakupa.id as neprebranaObvestila')
            .first();

        res.status(200).json({ neprebranaObvestila: neprebranaObvestila.neprebranaObvestila });
    } catch (error) {
        console.error('Napaka pri preštevanju neprebranih obvestil', error);
        res.status(500).json({ error: 'Napaka pri preštevanju neprebranih obvestil' });
    }
});

router.post('/prestej-neprebraneZamenjava', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'UserId manjka' });
        }

        const neprebranaObvestila = await knex('obvestilo_zamenjava')
            .join('oglas', 'obvestilo_zamenjava.fk_oglas_id', '=', 'oglas.id')
            .where(function () {
                this.where('oglas.fk_uporabnik_id', userId)
                    .andWhere('obvestilo_zamenjava.prebrano_prodajalec', false);
            })
            .orWhere(function () {
                this.where('obvestilo_zamenjava.fk_uporabnik_id', userId)
                    .andWhere('obvestilo_zamenjava.prebrano_kupec', false);
            })
            .count('obvestilo_zamenjava.id as neprebranaObvestila')
            .first();

        res.status(200).json({ neprebranaObvestila: neprebranaObvestila.neprebranaObvestila });
    } catch (error) {
        console.error('Napaka pri preštevanju neprebranih obvestil', error);
        res.status(500).json({ error: 'Napaka pri preštevanju neprebranih obvestil' });
    }
});

router.post('/preberiZamenjava', async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.body.userId;

        if (!id || !userId) {
            return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
        }

        const obvestilo = await knex('obvestilo_zamenjava')
            .where('id', id)
            .first();

        if (!obvestilo) {
            return res.status(404).json({ error: 'Obvestilo ne obstaja' });
        }

        const oglas = await knex('oglas')
            .where('id', obvestilo.fk_oglas_id)
            .first();

        if (!oglas) {
            return res.status(404).json({ error: 'Oglas ne obstaja' });
        }

        let updateObj = {};

        if (obvestilo.fk_uporabnik_id === userId) {
            updateObj.prebrano_kupec = true;
        }
        else if (oglas.fk_uporabnik_id === userId) {
            updateObj.prebrano_prodajalec = true;
        }
        else {
            return res.status(400).json({ error: 'Uporabnik nima pravic za označitev obvestila kot prebrano' });
        }

        await knex('obvestilo_zamenjava')
            .where('id', id)
            .update(updateObj);

        res.status(200).json({ message: 'Obvestilo je prebrano' });
    } catch (error) {
        console.error('Napaka pri označevanju vseh obvestil kot prebrana', error);
        res.status(500).json({ error: 'Napaka pri označevanju vseh obvestil kot prebrana' });
    }
});

router.post('/preberiVseZamenjave', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'UserId manjka' });
        }

        await knex('obvestilo_zamenjava')
            .join('oglas', 'obvestilo_zamenjava.fk_oglas_id', '=', 'oglas.id')
            .where('oglas.fk_uporabnik_id', userId)
            .update({ prebrano_prodajalec: true });

        await knex('obvestilo_zamenjava')
            .where('obvestilo_zamenjava.fk_uporabnik_id', userId)
            .update({ prebrano_kupec: true });

        res.status(200).json({ message: 'Obvestila označena kot prebrana' });
    } catch (error) {
        console.error('Napaka pri označevanju vseh obvestil kot prebrana', error);
        res.status(500).json({ error: 'Napaka pri označevanju vseh obvestil kot prebrana' });
    }
});

module.exports = router;