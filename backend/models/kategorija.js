var knex = require('../knexConfig');

class Kategorija {

    static async vsi() {
        try {
            const kategorije = await knex('kategorija').select('*');
            return kategorije;
        }
        catch (error) {
            throw new Error('Napaka pri pridobivanju kategorij iz baze: ' + error.message);
        }
    }

}


module.exports = Kategorija;

