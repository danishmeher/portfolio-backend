// server/server.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // or use global fetch if available

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  const { name, email, message, token } = req.body;

  if (!name || !email || !message || !token) {
    return res.status(400).json({ error: "Please fill all fields and verify captcha" });
  }

  try {
    // Verify token with Google reCAPTCHA v3
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`;
    const captchaResp = await fetch(verifyUrl, { method: "POST" });
    const captchaData = await captchaResp.json();

    // debug logs (you can remove later)
    console.log("reCAPTCHA verification response:", captchaData);

    // For v3 we check success and score (score range 0.0 - 1.0)
    // tweak threshold as needed (0.5 is common)
    if (!captchaData.success || (captchaData.score !== undefined && captchaData.score < 0.5)) {
      return res.status(400).json({ error: "Failed reCAPTCHA verification" });
    }

    // Send email with nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
