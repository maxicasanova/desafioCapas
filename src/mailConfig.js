const nodemailer = require('nodemailer');

const TEST_MAIL = 'lora98@ethereal.email';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: TEST_MAIL,
        pass: 'aWQxxVAN3X6U5D3vyn'
    }
});

module.exports = {
    transporter
}