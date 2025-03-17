# How to Restart the Backend Server

To apply the changes we've made to fix the email verification issue, you need to restart the backend server:

1. Find the running Node.js process for the backend server:

    - On Windows: Open Task Manager, find "node.exe" processes, and end the one running on port 4000
    - On Mac/Linux: Run `lsof -i :4000` to find the process ID, then `kill <PID>`

2. Start the server again:

    ```
    cd backend
    npm start
    ```

3. After restarting, try registering again. The registration should now succeed even if email sending fails.

## Email Configuration

If you want to enable actual email sending, make sure your `.env` file in the backend directory contains these variables:

```
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

Replace with your actual email credentials. The current email service is configured to use GoDaddy's SMTP server (smtpout.secureserver.net). If you're using a different email provider, you'll need to update the host in `emailService.js`.
