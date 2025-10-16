import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return res.status(400).json({ error });
    }

    console.log("✅ Email sent:", data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Send error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
