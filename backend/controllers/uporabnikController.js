const bcrypt = require('bcrypt');
const Uporabnik = require('../models/uporabnik');

async function dodajUporabnika(req, res) {
  const { ime, priimek, email, geslo, telefon, naslov, posta, drzava } = req.body;

  if (!ime || !priimek || !email || !geslo || !telefon || !naslov || !posta || !drzava) {
    return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(geslo, saltRounds);

    const newUser = await Uporabnik.dodaj(ime, priimek, email, hashedPassword, telefon, naslov, posta, drzava);
    
    res.status(200).json({ message: 'Uspešna registracija', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Napaka pri vstavljanju uporabnika v bazo', details: error.message });
  }
}

async function vsiUporabniki(req, res) {
  try {
    const users = await Uporabnik.vsi();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Napaka pri pridobivanju uporabnikov iz baze', details: error.message });
  }
}

async function najdiUporabnika(req, res) {
  const { id } = req.params;
  try {
    const user = await Uporabnik.getById(id);
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: 'Uporabnik ne obstaja' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Napaka pri pridobivanju uporabnika iz baze', details: error.message });
  }
}

async function posodobiUporabnika(req, res) {
  const { id } = req.params;
  const { ime, priimek, email, geslo, telefon, naslov, posta, drzava } = req.body;

  if (!ime || !priimek || !email || !geslo || !telefon || !naslov || !posta || !drzava) {
    return res.status(400).json({ error: 'Vsa polja morajo biti izpolnjena' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(geslo, saltRounds);

    const updatedUser = await Uporabnik.posodobi(id, ime, priimek, email, hashedPassword, telefon, naslov, posta, drzava);
    
    res.status(200).json({ message: 'Uspešno posodobljen uporabnik', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Napaka pri posodabljanju uporabnika v bazi', details: error.message });
  }
}

async function izbrisiUporabnika(req, res) {
  const { id } = req.params;
  try {
    const user = await Uporabnik.izbrisi(id);
    if (!user) {
      return res.status(404).json({ error: 'Uporabnik ne obstaja' });
    }
    res.status(200).json({ message: 'Uporabnik izbrisan', user: user });
  } catch (error) {
    res.status(500).json({ error: 'Napaka pri brisanju uporabnika iz baze', details: error.message });
  }
}

async function prijavljenUporabnik(req, res) {
  const email = req.body.email;
  console.log(email)
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  try {
    const user = await Uporabnik.getByEmail(email);
    if (!user) {
      return res.status(404).send({ error: 'No user found with this email' });
    }
    return res.status(200).send({ userId: user.id });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Something went wrong' });
  }
}

async function prijavljenProfil(req, res) {
  const email = req.body.email;
  console.log(email)
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  try {
    const user = await Uporabnik.getByEmail(email);
    if (!user) {
      return res.status(404).send({ error: 'Ni uporabnika s tem emailom' });
    }
    return res.status(200).send({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Something went wrong' });
  }
}

async function getEmailFromId(req, res) {
  const id = req.body.id;
  console.log(id)
  if (!id) {
    return res.status(400).send({ error: 'ID is required' });
  }

  try {
    const user = await Uporabnik.getById(id);
    if (!user) {
      return res.status(404).send({ error: 'No user found with this id' });
    }
    console.log(user.email)
    return res.status(200).send({ userEmail: user.email });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Something went wrong' });
  }
}

async function getEmailFromOglasId(req, res) {
  const id = req.body.id;
  console.log(id)
  if (!id) {
    return res.status(400).send({ error: 'ID is required' });
  }

  try {
    const user = await Uporabnik.getEmailFromOglasId(id);
    if (!user) {
      return res.status(404).send({ error: 'No user found with this id' });
    }
    console.log("tuki sem")
    console.log(user)
    return res.status(200).send({ userEmail: user.userEmail });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Something went wrong' });
  }
}

module.exports = {
  dodajUporabnika,
  vsiUporabniki,
  najdiUporabnika,
  posodobiUporabnika,
  izbrisiUporabnika,
  prijavljenUporabnik,
  prijavljenProfil,
  getEmailFromId,
  getEmailFromOglasId
};
