import { pool } from "../../lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";
import moment from "moment";

const sendVerificationCode = async (req, res) => {
  if (req.method === "POST") {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    try {
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const expiryTime = moment.utc().add(10, 'minutes').toDate();
        console.log("Calculated expiryTime (UTC):", expiryTime);

      // 存入数据库（此时用户还未注册）
      await pool.query(
        "INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 60 MINUTE) ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at)",
        [email, verificationCode, expiryTime]
      ).catch((err) => {
        console.error("Database error:", err);
        return res.status(400).json({ message: "Failed to insert verification code." });
      });

      // 发送验证码邮件
      const transporter = nodemailer.createTransport({
        service: "gmail", // 这里可以使用其他邮箱服务
        auth: {
          user: process.env.EMAIL_USER,  // 使用环境变量存储邮箱
          pass: process.env.EMAIL_PASS,  // 使用环境变量存储邮箱密码
        },
    });

      const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Verification Code",
        text: `Your verification code is: ${verificationCode}. It will expire in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "Verification code sent." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `Internal Server Error. ${error.message}` });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed." });
  }
};

export default sendVerificationCode;
