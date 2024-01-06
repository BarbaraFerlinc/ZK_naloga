const Nakup = require('../models/nakup');
const knex = require('../knexConfig');

async function dodajNakup(req, res) {

    const { osebni_prevzem, nacin_placila, fk_uporabnik_id, fk_oglas_id } = req.body;

    if (!nacin_placila) {
        return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
    }

    try {
        const oglas = await knex('oglas').select('jeZamenjan').where('id', fk_oglas_id).first();
        if (oglas.jeZamenjan === 1) {
            return res.status(400).json({ error: 'Oglas ni več na voljo!' });
        }

        const novNakup = await Nakup.dodaj(osebni_prevzem, nacin_placila, fk_uporabnik_id, fk_oglas_id);

        await knex('oglas').where('id', fk_oglas_id).update('jeZamenjan', 1);
        await knex('zamenjani').where('fk_oglas_id', fk_oglas_id).update('jePotrjen', 1);


        res.status(200).json({ message: 'ok', nakup: novNakup });
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Napaka pri shranjevanju nakupa' });
    }

}

module.exports = {
    dodajNakup
};