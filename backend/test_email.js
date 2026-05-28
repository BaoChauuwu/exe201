const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'baochaudeptrai300@gmail.com',
    pass: 'ttmu zepy rgzb jukh'
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
