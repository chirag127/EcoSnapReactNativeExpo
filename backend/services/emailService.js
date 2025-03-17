import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (email, subject, text) => {
    try {
        if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
            console.error(
                "Email configuration missing: EMAIL_USERNAME or EMAIL_PASSWORD not set in .env file"
            );
            return false; // Return false instead of throwing error to allow registration to continue
        }

        if (email) {
            console.log(`Attempting to send email to ${email}`);

            const transporter = nodemailer.createTransport({
                host: "smtpout.secureserver.net",
                port: 465, // Use port 465 for secure connections (SSL/TLS)
                secure: true,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USERNAME,
                to: `${email}`,
                subject: subject,
                html: text,
            });

            console.log(`Email sent successfully to ${email}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error sending email:", error);
        return false; // Return false instead of throwing error to allow registration to continue
    }
};

export default sendEmail;
