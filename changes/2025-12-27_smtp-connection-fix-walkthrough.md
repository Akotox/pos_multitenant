# SMTP Connection Fix Walkthrough

I have improved the email service's logging and configuration to help diagnose and resolve the connection issues.

## Changes Made

### [Infrastructure]

#### [email.service.ts](file:///Users/mac/bandas/src/infrastructure/services/email.service.ts)
- **Enhanced Logging**: Added initialization logs to show which host and port are being used (without leaking credentials).
- **Detailed Error Reporting**: Improved error logs to include specific nodemailer error codes and responses.
- **Connection Timeouts**: Added `connectionTimeout` and `greetingTimeout` (10 seconds) to ensure the service fails quickly and clearly if the server is unreachable.

render_diffs(file:///Users/mac/bandas/src/infrastructure/services/email.service.ts)

## Verification Instructions

Since I cannot modify your `.env` file directly, please follow these steps to verify the fix:

1.  **Check `.env` File**: Open [`.env`](file:///Users/mac/bandas/.env) and ensure the following are correct:
    - `SMTP_HOST`: Should be your provider's SMTP host (e.g., `smtp.gmail.com`).
    - `SMTP_PORT`: Usually `587` (TLS) or `465` (SSL).
    - `SMTP_USER`: Your email address or API key.
    - `SMTP_PASS`: Your password or app-specific password.
    - `SMTP_SECURE`: `true` for port 465, `false` for port 587.

2.  **Restart Application**:
    ```bash
    npm run dev
    ```

3.  **Monitor Logs**:
    - Look for: `Initializing SMTP Email Service with host: ..., port: ..., secure: ...`
    - Trigger an email (e.g., by registering a new user).
    - Look for success: `Email successfully sent to ...` or detailed error logs if it still fails.

> [!TIP]
> If you are using Gmail, make sure to use an **App Password** if you have 2FA enabled.
