const express = require("express");
let path = require('path');
let  cookieParser = require('cookie-parser');
let logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

// routerji
let artikelRouter = require('./routes/artikel');
let kategorijaRouter = require('./routes/kategorijaRouter');
let mailRouter = require('./routes/mailSender');
let nakupRouter = require('./routes/nakupRouter');
let uporabnikRouter = require('./routes/uporabnikRouter');
let zamenjavaRouter = require('./routes/zamenjava');
let obvestiloRouter = require('./routes/obvestilo')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_CORS);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// uporaba routerjev
app.use('/artikel/', artikelRouter);
app.use('/kategorija/', kategorijaRouter);
app.use('/mail/', mailRouter);
app.use('/nakup/', nakupRouter);
app.use('/uporabnik/', uporabnikRouter);
app.use('/zamenjava', zamenjavaRouter);
app.use('/obvestilo', obvestiloRouter);

// Dodajanje statične poti za dostop do slik
app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT || 9000, () => {
  console.log("Strežnik na portu " + 9000);
});
module.exports = app;