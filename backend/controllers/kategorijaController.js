const Kategorija = require('../models/kategorija');


async function vseKategorije(req, res) {
    try {
        const kategorije = await Kategorija.vsi();
        res.status(200).json(kategorije);
    }
    catch (error) {
        res.status(500).json({ error: 'Napaka pri pridobivanju kategorij iz baze', details: error.message });
    }
}


module.exports = {
    vseKategorije
};