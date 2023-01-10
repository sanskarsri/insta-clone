const nodemailer = require("nodemailer");

module.exports = async(to,subject,message) =>{
    try{
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.USER, 
            to: to, 
            subject: subject, 
            text: message, 
            html: `<h3> ${message}</h3>`, 
          });

          console.log("Email Sent Successfully");
    }
    catch(err)
    {
        console.log("Email Not Sent");

        console.log(err);
    }
};