const nodemailer = require('nodemailer')

//send emails
const sendEmail = async (options) => {
  //1> create transporter
  let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '661b7898d49611',
      pass: '6fadbbcee616ab',
    },
  })

  //2> define email options
  const mailOptions = {
    from: 'dhaval agrawal <gobele2406@shensufu.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  //3> actually send the email

  await transport.sendMail(mailOptions)
}

module.exports = sendEmail
