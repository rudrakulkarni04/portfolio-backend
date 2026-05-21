require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();

// IMPORTANT: Render provides PORT automatically
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// -----------------------------
// ENV SAFETY CHECK (VERY IMPORTANT)
// -----------------------------
if (!process.env.RESEND_API_KEY) {
    console.error("❌ Missing RESEND_API_KEY in environment variables!");
    process.exit(1);
}

if (!process.env.RECEIVER_EMAIL) {
    console.error("❌ Missing RECEIVER_EMAIL in environment variables!");
    process.exit(1);
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Health check route
app.get('/', (req, res) => {
    res.send('🚀 Backend is running successfully');
});

// -----------------------------
// CONTACT FORM ROUTE
// -----------------------------
app.post('/send-mail', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and message are required'
            });
        }

        // Send email using Resend
        const response = await resend.emails.send({
            from: 'Portfolio <onboarding@resend.dev>',
            to: process.env.RECEIVER_EMAIL,
            subject: subject || 'New Portfolio Contact Message',
            html: `
                <h2>📩 New Message from Portfolio</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Subject:</b> ${subject || 'N/A'}</p>
                <p><b>Message:</b></p>
                <p>${message}</p>
            `
        });

        console.log("✅ Email sent successfully:", response);

        return res.json({
            success: true,
            message: "Email sent successfully",
            response
        });

    } catch (error) {
        console.error("❌ Resend Error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to send email"
        });
    }
});

// -----------------------------
// START SERVER (RENDER SAFE)
// -----------------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});