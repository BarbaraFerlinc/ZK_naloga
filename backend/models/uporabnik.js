const knex = require('../knexConfig');
const bcrypt = require('bcrypt');

class Uporabnik {
    static async dodaj(ime, priimek, email, geslo, telefon, naslov, posta, drzava) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(geslo, saltRounds);

        try {
            const newUser = await knex('uporabnik').insert({
                ime: ime,
                priimek: priimek,
                email: email,
                geslo: hashedPassword,
                telefon: telefon,
                naslov: naslov,
                posta: posta,
                drzava: drzava,
            });
            console.log(newUser);

            return { message: 'Uspešna registracija', user: newUser };
        } catch (error) {
            throw new Error('Napaka pri vstavljanju uporabnika v bazo: ' + error.message);
        }
    }
    
    static async vsi() {
        try {
            const users = await knex('uporabnik').select('*');
            return users;
        } catch (error) {
            throw new Error('Napaka pri pridobivanju uporabnikov iz baze: ' + error.message);
        }
    }

    static async getById(id) {
        try {
            const user = await knex('uporabnik').select('*').where('id', id).first();
            return user;
        } catch (error) {
            throw new Error('Napaka pri pridobivanju uporabnika iz baze: ' + error.message);
        }
    }

    static async izbrisi(id) {
        try {
            const user = await knex('uporabnik').select('*').where('id', id).first();
            if (!user) {
                throw new Error('Uporabnik ne obstaja');
            }
            await knex('uporabnik').where('id', id).del();
            return { message: 'Uporabnik izbrisan', user: user };
        } catch (error) {
            throw new Error('Napaka pri brisanju uporabnika iz baze: ' + error.message);
        }
    }

    static async posodobi(id, ime, priimek, email, geslo, telefon, naslov, posta, drzava) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(geslo, saltRounds);

        try {
            const user = await knex('uporabnik').select('*').where('id', id).first();
            if (!user) {
                throw new Error('Uporabnik ne obstaja');
            }
            await knex('uporabnik')
                .where('id', id)
                .update({
                    ime: ime,
                    priimek: priimek,
                    email: email,
                    geslo: hashedPassword,
                    telefon: telefon,
                    naslov: naslov,
                    posta: posta,
                    drzava: drzava
                });
            return { message: 'Uspešno posodobljen uporabnik', user: user };
        } catch (error) {
            throw new Error('Napaka pri posodabljanju uporabnika v bazi: ' + error.message);
        }
    }

    static async getByEmail(email) {
        try {
            const user = await knex('uporabnik').select('*').where('email', email).first();
            return user;
        } catch (error) {
            throw new Error('Napaka pri pridobivanju uporabnika iz baze: ' + error.message);
        }
    }

    static async getEmailFromId(id) {
        try {
            const user = await knex('uporabnik').select('email').where('id', id).first();
            if (!user) {
                throw new Error('Uporabnik ne obstaja');
            }
            return { userEmail: user.email };
        } catch (error) {
            throw new Error('Napaka pri pridobivanju emaila iz baze: ' + error.message);
        }
    }

    static async getEmailFromOglasId(id) {
        try {
            const user = await knex('uporabnik')
                .join('oglas', 'uporabnik.id', '=', 'oglas.fk_uporabnik_id')
                .where('oglas.id', id)
                .first();
            if (!user) {
                throw new Error('Uporabnik ne obstaja');
            }
            return { userEmail: user.email };
        } catch (error) {
            throw new Error('Napaka pri pridobivanju emaila iz baze: ' + error.message);
        }
    }
}

module.exports = Uporabnik;