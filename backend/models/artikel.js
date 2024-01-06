var knex = require('../knexConfig');
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


class Artikel {
    static async dodaj(naslov, velikost, opis, cena, lokacija, osebni_prevzem, za_zamenjavo, jeZamenjan, fk_uporabnik_id, fk_kategorija_id) {
        if (!naslov || !velikost || !opis || !cena || !lokacija || !osebni_prevzem || !za_zamenjavo) {
            return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
        }

        if (req.files.length > 5) {
            return { message: 'Lahko naložite največ 5 slik.' };
        }

        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                if (req.files[i].size > maxSize) {
                    return { message: 'Vsaka slika mora biti manjša od 1MB' };
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

            return { message: 'ok', oglas: novOglas };
        } catch (error) {
            console.error(error)
            throw new Error('Napaka pri vstavljanju artikla v bazo: ' + error.message);
        }
    }


    static async vsi() {
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

            return oglasi;
        } catch (error) {
            throw new Error('Napaka pri pridobivanju oglasov iz baze');
        }
    }


    static async getById(id) {
        try {
            const oglas = await knex('oglas').select('*').where('id', id).first();

            if (!oglas) {
                return ('Oglas ne obstaja');
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
                return ('Uporabnik ne obstaja');
            }
            if (oglas.jeZamenjan === 1) {
                return ('Oglas je že zamenjan');
            }


            // Add the user to the ad object
            oglas.uporabnik = uporabnik;
            return oglas;
        }
        catch (error) {
            throw new Error('Napaka pri pridobivanju oglasa iz baze: ' + error.message);
        }
    }

    static async izbrisi(id) {
        try {
            const oglas = await knex('oglas').select('*').where('id', id);
            if (oglas.length === 0) {
                return ('Oglas ne obstaja');
            }
            await knex('oglas').where('id', id).del();
            return ('Oglas izbrisan');
        }
        catch (error) {
            throw new Error('Napaka pri brisanju oglasa iz baze: ' + error.message);
        }
    }

    static async posodobi(naslov, velikost, opis, cena, lokacija, osebni_prevzem, za_zamenjavo, jeZamenjan, fk_uporabnik_id, fk_kategorija_id) {

        if (!naslov || !velikost || !opis || !cena || !lokacija || !za_zamenjavo) {
            return ('Vsa polja morajo biti izpolnjena');
        }

        if (req.files.length > 5) {
            return ('Lahko naložite največ 5 slik.');
        }

        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                if (req.files[i].size > maxSize) {
                    return ('Vsaka slika mora biti manjša od 1MB');
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
                return { message: 'ok', oglas: posodobiOglas };
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

            return { message: 'ok', oglas: posodobiOglas };
        } catch (error) {
            console.error(error)
            throw new Error('Napaka pri posodabljanju oglasa');
        }
    }

    static async getByKategorija(id) {
        try {
            const oglas = await knex('oglas').select('*').where('fk_kategorija_id', id);
            if (oglas.length === 0) {
                return ('Oglas s to kategorijo ne obstaja');
            }
            return oglas;
        }
        catch (error) {
            throw new Error('Napaka pri pridobivanju oglasa: ' + error.message);
        }
    }


    static async getSlikeById(id) {
        if (!id) {
            return ('ID oglasa je obvezen');
        }

        try {
            const slike = await knex('slika').where({ fk_oglas_id: id });

            if (!slike.length) {
                return ('Za ta oglas ni najdenih slik');
            }

            return slike;
        } catch (error) {
            throw new Error('Napaka pri pridobivanju slik iz baze: ' + error.message);
        }
    }


    static async getByProfil(id) {
        try {
            const oglas = await knex('oglas')
                .select('*')
                .where('fk_uporabnik_id', id);
            return oglas;
        } catch (error) {
            throw new Error('Napaka pri pridobivanju oglasov iz baze: ' + error.message);
        }
    }


}

module.exports = Artikel;