var knex = require('./knexConfig');

async function baza() {
    await knex.schema.dropTableIfExists('slika_zamenjanih').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('slika').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('obvestilo_nakupa').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('obvestilo_zamenjava').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('zamenjani').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('nakup').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('oglas').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('kategorija').catch((err) => { console.log(err); throw err });
    await knex.schema.dropTableIfExists('uporabnik').catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('uporabnik', (table) => {
        table.increments('id');
        table.string('ime').notNullable();
        table.string('priimek').notNullable();
        table.string('email').notNullable();
        table.string('geslo').notNullable();
        table.string('telefon').notNullable();
        table.string('naslov').notNullable();
        table.string('posta').notNullable();
        table.string('drzava').notNullable();
    }).then(() => console.log('Tabela uporabnik ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('kategorija', (table) => {
        table.increments('id');
        table.string('naziv').notNullable();
    }).then(() => console.log('Tabela kategorija ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('oglas', (table) => {
        table.increments('id');
        table.string('naslov').notNullable();
        table.string('velikost').notNullable();
        table.text('opis', 'longtext').notNullable();
        table.integer('cena').notNullable();
        table.string('lokacija').notNullable();
        table.boolean('osebni_prevzem').notNullable();
        table.boolean('za_zamenjavo').notNullable();
        table.boolean('jeZamenjan').notNullable();
        table.integer('fk_uporabnik_id').references('id').inTable('uporabnik').unsigned().onDelete('CASCADE');
        table.integer('fk_kategorija_id').references('id').inTable('kategorija').unsigned().onDelete('CASCADE');
    }).then(() => console.log('Tabela oglas ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('slika', (table) => {
        table.increments('id');
        table.string('pot').notNullable();
        table.integer('fk_oglas_id').references('id').inTable('oglas').unsigned().onDelete('CASCADE');
    }).then(() => console.log('Tabela slika ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('zamenjani', (table) => {
        table.increments('id');
        table.string('naslov').notNullable();
        table.string('velikost').notNullable();
        table.text('opis', 'longtext').notNullable();
        table.boolean('jePotrjen').notNullable();
        table.boolean('potrjenaZamenjava').notNullable();
        table.boolean('prebrano').notNullable().defaultTo(false);
        table.integer('fk_oglas_id').references('id').inTable('oglas').unsigned().onDelete('CASCADE');
        table.integer('fk_uporabnik_id').references('id').inTable('uporabnik').unsigned().onDelete('CASCADE');
        table.integer('fk_kategorija_id').references('id').inTable('kategorija').unsigned().onDelete('CASCADE');
    }).then(() => console.log('Tabela zamenjani ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('slika_zamenjanih', (table) => {
        table.increments('id');
        table.string('pot').notNullable();
        table.integer('fk_zamenjani_id').references('id').inTable('zamenjani').unsigned().onDelete('CASCADE');
    }).then(() => console.log('Tabela slika ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('nakup', (table) => {
        table.increments('id');
        table.boolean('osebni_prevzem').notNullable();
        table.string('nacin_placila').notNullable();
        table.integer('fk_oglas_id').references('id').inTable('oglas').notNullable().unsigned().onDelete('CASCADE');
        table.integer('fk_uporabnik_id').references('id').inTable('uporabnik').notNullable().unsigned().onDelete('CASCADE');
    }).then(() => console.log('Tabela nakup ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('obvestilo_zamenjava', (table) => {
        table.increments('id');
        table.integer('fk_oglas_id').references('id').inTable('oglas').notNullable().unsigned().onDelete('CASCADE');
        table.integer('fk_uporabnik_id').references('id').inTable('uporabnik').notNullable().unsigned().onDelete('CASCADE');
        table.integer('jeSprejeto').notNullable();
        table.datetime('datum').notNullable().defaultTo(knex.fn.now());
        table.boolean('prebrano_kupec').notNullable().defaultTo(false);
        table.boolean('prebrano_prodajalec').notNullable().defaultTo(false);
    }).then(() => console.log('Tabela obvestilo_zamenjave ustvarjena.'))
        .catch((err) => { console.log(err); throw err });

    await knex.schema.createTable('obvestilo_nakupa', (table) => {
        table.increments('id');
        table.integer('fk_oglas_id').references('id').inTable('oglas').notNullable().unsigned().onDelete('CASCADE');
        table.integer('fk_uporabnik_id').references('id').inTable('uporabnik').notNullable().unsigned().onDelete('CASCADE');
        table.datetime('datum').notNullable().defaultTo(knex.fn.now());
        table.boolean('prebrano_kupec').notNullable().defaultTo(false);
        table.boolean('prebrano_prodajalec').notNullable().defaultTo(false);
    }).then(()=> console.log('Tabela obvestilo_nakupa ustvarjena.'))
        .catch((err) => {console.log(err); throw err})

    const kategorija = [
        { naziv: 'Otroške majice' },
        { naziv: 'Otroške hlače' },
        { naziv: 'Kratke majice' },
        { naziv: 'Majice' },
        { naziv: 'Kratke hlače' },
        { naziv: 'Dolge hlače' },
        { naziv: 'Obleke' },
        { naziv: 'Jakne' },
        { naziv: 'Puloverji' },
        { naziv: 'Srajce' },
        { naziv: 'Krila' },
        { naziv: 'Dodatki' }
    ]

    await knex('kategorija').insert(kategorija).then(() => console.log('Vstavljena kategorija.'))
        .catch((err) => { console.log(err); throw err });

    knex.destroy();
}

baza();