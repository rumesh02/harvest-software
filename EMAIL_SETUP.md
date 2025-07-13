# Email Configuration Setup Instructions

## Gmail App Password Setup for Contact Form

To enable email functionality for your contact form, you need to set up an App Password for Gmail. Follow these steps:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other" as the device and enter "Harvest Software"
4. Click "Generate"
5. Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)

### Step 3: Update Environment Variables
1. Open your backend `.env` file
2. Replace `your-app-password-here` with the generated app password (remove spaces)
3. Your `.env` should look like:
   ```
   ADMIN_EMAIL=dularamihiran@gmail.com
   ADMIN_EMAIL_PASSWORD=abcdabcdabcdabcd
   ```

### Step 4: Test the Setup
1. Start your backend server: `npm start`
2. Go to your contact form on the website
3. Fill out the form and submit
4. Check that:
   - You receive an email notification at dularamihiran@gmail.com
   - The user receives a confirmation email

### Alternative Email Services

If you prefer not to use Gmail, you can configure other email services:

#### Outlook/Hotmail
```javascript
// In emailService.js, update createTransporter:
service: 'hotmail',
auth: {
  user: process.env.ADMIN_EMAIL,
  pass: process.env.ADMIN_EMAIL_PASSWORD
}
```

#### Yahoo Mail
```javascript
// In emailService.js, update createTransporter:
service: 'yahoo',
auth: {
  user: process.env.ADMIN_EMAIL,
  pass: process.env.ADMIN_EMAIL_PASSWORD
}
```

#### Custom SMTP
```javascript
// In emailService.js, update createTransporter:
host: 'your-smtp-server.com',
port: 587,
secure: false,
auth: {
  user: process.env.ADMIN_EMAIL,
  pass: process.env.ADMIN_EMAIL_PASSWORD
}
```

### Security Notes
- Never commit your actual email password to version control
- Use environment variables for all sensitive information
- Consider using a dedicated email account for application notifications
- Regularly rotate your app passwords

### Troubleshooting
- If emails aren't sending, check the console for error messages
- Verify your email credentials are correct
- Ensure your firewall allows outbound SMTP connections
- For Gmail, make sure 2FA is enabled and you're using an App Password, not your regular password
