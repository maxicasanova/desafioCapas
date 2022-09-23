const nodemailer = require('nodemailer');

require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
        user: process.env.TEST_MAIL,
        pass: process.env.MAIL_PASS
    }
});

let mailOptions = {
    from: "Servidor Node",
    to: process.env.TO_MAIL,
    subject:'nuevo registro',
    html: '',
};

module.exports = {
    transporter, 
    mailOptions
}