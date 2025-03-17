# Troubleshooting Guide for EcoSnap Registration Issues

If you're experiencing issues with user registration, follow these steps to diagnose and fix the problem:

## 1. Check if the Backend Server is Running

Run the test script to check if the backend server is accessible:

```bash
cd backend
node test-server.js
```

If you see "Server is running correctly!", the server is up and responding.

If you see an error, the server might be down or unreachable.

## 2. Restart the Backend Server

```bash
# Find and kill the existing Node.js process
# On Windows: Use Task Manager to end node.exe processes
# On Mac/Linux: Run `lsof -i :4000` to find the PID, then `kill <PID>`

# Start the server again
cd backend
npm start
```

## 3. Check Email Configuration

If registration fails with a 400 Bad Request error, it might be related to email configuration.

Open your `.env` file in the backend directory and make sure it contains:

```
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

If you don't want to set up email verification right now, the system should still allow registration without sending emails (we've added fallbacks for this).

## 4. Check MongoDB Connection

Make sure your MongoDB connection string in the `.env` file is correct:

```
MONGODB_URI=your_mongodb_uri
```

## 5. Check for Detailed Error Messages

We've added more detailed error logging. Check the browser console and the backend terminal for specific error messages.

## 6. Try with a Different Email

If you're getting "Email already in use" errors, try registering with a different email address.

## 7. Clear Browser Storage

Try clearing your browser's local storage and cookies, then refresh the page.

## 8. Check Network Tab

In your browser's developer tools, check the Network tab when attempting to register. Look for the request to `/api/auth/register` and examine the response for more details about the error.

## 9. Temporary Workaround

If you still can't register, you can modify the backend code to bypass email verification:

1. Open `backend/routes/auth.js`
2. Find the registration route
3. Add `isVerified: true` to the user object when creating a new user
4. Restart the server

This will create users that are already verified, bypassing the email verification step.
