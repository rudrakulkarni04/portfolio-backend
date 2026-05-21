require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/send-mail', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const response = await resend.emails.send({
            from: 'Portfolio <onboarding@resend.dev>', // OK for testing
            to: [process.env.RECEIVER_EMAIL],
            subject: subject || 'New Contact Form Message',
            html: `
                <h2>New Message from Portfolio</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `
        });

        console.log("Resend Response:", response);

        return res.json({
            success: true,
            message: "Email sent (check spam too)",
            response
        });

    } catch (error) {
        console.error('❌ Resend Error:', error);
        return res.status(500).json({
            error: error.message
        });
    }
    console.log("EMAIL RESPONSE:", JSON.stringify(response, null, 2));
});