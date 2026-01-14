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

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const result = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    });

    // Always return a JSON response after sending email
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (err) {
    console.error("❌ Send error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while sending email",
    });
  }
});


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
