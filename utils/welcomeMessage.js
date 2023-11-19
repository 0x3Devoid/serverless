const nodeMailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const logFilePath = path.join(__dirname, "email_log.txt");

async function sendCode(to, link) {

  const transporter = nodeMailer.createTransport({
    // host: 'smtp.gmail.com',
    service: "gmail",
    // secure: true,
    // port: 587,
    auth: {
      user: "devowoyemi123@gmail.com",
      pass: "imkpvizhfzjpbaum",
    },
    // connectionTimeout: 30000,
    // greetingTimeout: 30000,
    // socketTimeout: 30000,
  });

  const mailOptions = {
    from: "devowoyemi123@gmail.com",
    to: to,
    subject: "Email Verification Link",
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body style="background-color: #fff; padding: 0; margin: 0; color: #000;">
  <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#fff" style="background-color: #fff; padding: 50px 10px; color: #000">
    <tr>
        <td style="text-align: center; padding-bottom: 20px;">
          <a href="#">
            <img src="https://res.cloudinary.com/dxqgshzri/image/upload/v1700353699/brand_uqk9tw.jpg" width="45" height="40px" alt="Chakra">
          </a>
        </td>
      </tr>
    <tr>
      <td align="center" valign="top" style="padding: 0px 30px; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px;">
        <table width="500" cellspacing="0" cellpadding="0" bgcolor="#fff" style="background-color: #fff; border: 1px solid #fff; border-radius: 5px; padding: 20px;">
         
         <tr>
            <td style="text-align: left;">
              <h3 style="font-size: 18px; margin-top: 10px; margin-bottom: 10px;"> <span style="color: #7E8FF2;"> Welcome to Chakra, </span> this is your confirmation link</h3>
              <a href=${link} style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px">Verify</a>
            </td>
          </tr>
        </table>
        <div style="text-align: left;">
          <p>This email was sent from an unmonitored mailbox.</p>
          <a href="#" style="color: #6762ed; text-decoration: none;">Unsubscribe</a> |
          <a href="#" style="color: #6762ed; text-decoration: none;">Privacy Statement</a>
          <p>Chakra Supports, One Juliene Way, Redmond, WA 98052 USA</p>
          <img src="https://res.cloudinary.com/dxqgshzri/image/upload/v1700353699/brand_uqk9tw.jpg" width="45" height="40px" alt="Chakra">
          <p>Thanks from Chakra Community</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`,
  };

  fs.appendFileSync(
    logFilePath,
    `\n\n[${new Date().toLocaleString()}] Sending email to ${to}`
  );

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error from sending Emails");
      console.error(error);
      fs.appendFileSync(logFilePath, `\nFailed: ${error.message}`);
      return error;
    } else {
      console.log(info.response);
      fs.appendFileSync(logFilePath, `\nSuccess: ${info.response}`);
      return info.response;
    }
  });
}
module.exports = sendCode;

// sendCode("0x3devoid@gmail.com", 'newchakraerc.com')
