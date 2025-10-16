import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import fetch from "node-fetch"; // only needed if Node < 18
import dotenv from "dotenv";

dotenv.config(); // loads .env values
const app = express();
app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  const { name, email, message, token } = req.body;

  console.log("📩 Incoming message:", { name, email, message });
  console.log("🧠 Token received:", token ? "Yes" : "No");

  if (!name || !email || !message || !token) {
    return res.status(400).json({ error: "Please fill all fields and verify captcha" });
  }

  try {
    // Verify reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`;
    const captchaResp = await fetch(verifyUrl, { method: "POST" });
    const captchaData = await captchaResp.json();

    console.log("🔍 reCAPTCHA response:", captchaData);

    if (!captchaData.success || (captchaData.score !== undefined && captchaData.score < 0.5)) {
      console.log("🚫 reCAPTCHA failed!");
      return res.status(400).json({ error: "Failed reCAPTCHA verification" });
    } 

    // Send email
    console.log("📨 Sending email...");
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
    console.log("✅ Email sent:", info.response);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});
app.listen(5000, () => console.log("✅ Server running on port 5000"));