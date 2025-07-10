# Password Reset Guide

This document explains how the password reset functionality works in the application.

## Overview

The password reset flow follows the standard Supabase authentication pattern:

1. User requests password reset by entering their email
2. System sends a confirmation email with a reset link
3. User clicks the link in their email
4. User is taken to a password reset page where they can set a new password
5. User is redirected back to login after successful password reset

## How It Works

### Step 1: Request Password Reset
- User goes to the login page
- Clicks "Reset password" link
- Enters their email address
- System sends a password reset email

### Step 2: Email Confirmation
- User receives an email with a reset link
- The link contains access and refresh tokens
- Link format: `https://yourapp.com/reset-password?access_token=xxx&refresh_token=xxx`

### Step 3: Set New Password
- User clicks the link in their email
- They are taken to `/reset-password` page
- User enters and confirms their new password
- System updates the password and redirects to login

## Files Involved

### Core Components
- `src/pages/ResetPassword.tsx` - Password reset page
- `src/components/auth/AuthForm.tsx` - Login form with reset option
- `src/hooks/useAuthActions.ts` - Password reset logic
- `src/utils/passwordResetUtils.ts` - Utility functions

### Supabase Functions
- `supabase/functions/reset-password/index.ts` - Edge function for password reset

### Translations
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/ar.json` - Arabic translations

## Testing the Flow

1. Go to the login page
2. Click "Reset password"
3. Enter a valid email address
4. Check your email for the reset link
5. Click the link and set a new password
6. Verify you can login with the new password

## Security Features

- Reset links contain secure tokens
- Links expire after a set time
- Password validation (minimum 6 characters)
- Confirmation password requirement
- Invalid link handling

## Error Handling

The system handles various error scenarios:
- Invalid email addresses
- Non-existent accounts
- Expired reset links
- Network errors
- Invalid passwords

## Configuration

The reset link redirect URL is configured in:
- `src/utils/passwordResetUtils.ts` - `redirectTo` parameter
- `src/hooks/useAuthActions.ts` - Reset email configuration

Make sure the redirect URL matches your application's domain. 