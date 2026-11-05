import { Button, EmailLayout } from '@emails/_shared'

export const ForgotPasswordEmail = (props: {
  username: string
  resetLink: string
}) =>
  EmailLayout(
    'Reset your Rozumari password securely.',
    /* HTML */ `
      <h1
        style="
          margin: 0 0 8px;
          color: #171717;
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
          text-align: center;
        "
      >
        Reset your password
      </h1>

      <p
        style="
          margin: 0 0 24px;
          color: #171717;
          font-size: 16px;
          line-height: 24px;
        "
      >
        Hi ${props.username},
      </p>

      <p
        style="
          margin: 0 0 24px;
          color: #171717;
          font-size: 16px;
          line-height: 24px;
        "
      >
        We received a request to reset your Rozumari password. Click the button
        below to choose a new password.
      </p>

      <div
        style="
          margin: 0 0 24px;
          text-align: center;
        "
      >
        ${Button({
          href: props.resetLink,
          text: 'Reset Password',
        })}
      </div>

      <p
        style="
          margin: 0 0 12px;
          color: #737373;
          font-size: 13px;
          line-height: 20px;
        "
      >
        This password reset link will expire after a limited time.
      </p>

      <p
        style="
          margin: 0;
          color: #737373;
          font-size: 13px;
          line-height: 20px;
        "
      >
        If you didn't request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
      </p>
    `
  )
