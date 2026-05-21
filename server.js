require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Safety check
if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
}

if (!process.env.RECEIVER_EMAIL) {
    console.error("Missing RECEIVER_EMAIL");
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
    res.send('Backend running 🚀');
});

app.post('/send-mail', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: "Missing fields"
            });
        }

        const data = await resend.emails.send({
            to: process.env.RECEIVER_EMAIL,
           from: "Portfolio <onboarding@resend.dev>",  // ✅ FIX HERE
            reply_to: email,
            subject: subject || "New Portfolio Message",
            html: `
                <h2>New Message</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `
        });

        console.log("Email sent:", data);

        return res.json({
            success: true,
            message: "Email sent",
            data
        });

    } catch (err) {
        console.error("Resend error:", err);

        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
});