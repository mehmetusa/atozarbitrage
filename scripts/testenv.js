// test-smtp.js
import nodemailer from 'nodemailer';

async function testSMTP() {
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log(
    'SMTP_PASS length:',
    process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 'undefined',
  );
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: 'inoordon@gmail.com',
        pass: process.env.SMTP_PASS, // use env variable for safety
      },
    });

    const info = await transporter.sendMail({
      from: '"SMTP Test" <inoordon@gmail.com>',
      to: 'your-email@example.com', // put your own email
      subject: 'SMTP Test',
      text: 'If you see this, SMTP credentials are correct ✅',
    });

    console.log('✅ Message sent:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP test failed:', err.message);
  }
}

testSMTP();
