require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend (optional but safe)
app.use(express.static(path.join(__dirname, 'public')));

// SMTP CONFIG
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// TEST SMTP CONNECTION
transporter.verify((err) => {
    if (err) {
        console.log("❌ Email server error:", err);
    } else {
        console.log("✅ Email server ready");
    }
});

// CONTACT ROUTE
app.post('/send-mail', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: subject || "New Contact Form Message",
            html: `
                <h2>New Message</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Subject:</b> ${subject}</p>
                <p><b>Message:</b> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Email failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});