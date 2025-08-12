const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "siguiendolaluna07@gmail.com",
    pass: "znjm qfjj iiuj mvzm",
  },
});