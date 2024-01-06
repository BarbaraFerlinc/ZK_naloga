var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

async function sendEmail(to, subject, body, attachments) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to,
    subject: subject,
    text: body,
  };

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }
  
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log("uspesno")
    }
  });
}

router.post('/poslji', async (req, res) => {
  const {subject, body, to, pdfDataUri} = req.body;

  let attachments = [];

  try {
    if (pdfDataUri) {
      const pdfBuffer = Buffer.from(pdfDataUri.split(',')[1], 'base64');
      attachments.push({ filename: 'Racun.pdf', content: pdfBuffer });
    }

    await sendEmail(to, subject, body, attachments);
    res.status(200).json({message: 'ok'});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;