var knex = require('../knexConfig');

class Nakup {

    static async dodaj(osebni_prevzem, nacin_placila, fk_uporabnik_id, fk_oglas_id) {

        try {
            const oglas = await knex('oglas').select('jeZamenjan').where('id', fk_oglas_id).first();
            if (oglas.jeZamenjan === 1) {
                return ('Oglas ni več na voljo!');
            }

            const novNakup = await knex('nakup').insert({
                osebni_prevzem: osebni_prevzem,
                nacin_placila: nacin_placila,
                fk_uporabnik_id: fk_uporabnik_id,
                fk_oglas_id: fk_oglas_id
            });

            await knex('oglas').where('id', fk_oglas_id).update('jeZamenjan', 1);
            await knex('zamenjani').where('fk_oglas_id', fk_oglas_id).update('jePotrjen', 1);

            return novNakup;
        } catch (error) {
            console.error(error)
            throw new Error ( 'Napaka pri shranjevanju nakupa' );
        }
    }
}

module.exports = Nakup;