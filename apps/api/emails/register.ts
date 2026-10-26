import { Button, EmailLayout } from '@emails/_shared'

export const RegisterEmail = (props: {
  username: string
  verificationLink: string
}) =>
  EmailLayout(
    `Verify your Rozumari account to get started, ${props.username}`,
    /* HTML */ `
      <h1
        class="email-text"
        style="
        margin: 0 0 8px 0;
        color: #171717;
        font-size: 24px;
        line-height: 32px;
        font-weight: 600;
        text-align: center;
      "
      >
        Verify your email address
      </h1>

      <p
        class="email-text"
        style="
        margin: 0 0 24px 0;
        color: #171717;
        font-size: 16px;
        line-height: 24px;
      "
      >
        Hi ${props.username},
      </p>

      <p
        class="email-text"
        style="
        margin: 0 0 24px 0;
        color: #171717;
        font-size: 16px;
        line-height: 24px;
      "
      >
        Thanks for creating your Rozumari account. Please verify your email
        address to get started.
      </p>

      <!-- Button -->
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        border="0"
        width="100%"
        style="margin: 0 0 24px 0;"
      >
        <tr>
          <td align="center">
            ${Button({
              href: props.verificationLink,
              text: 'Verify your email',
            })}
          </td>
        </tr>
      </table>

      <p
        class="email-muted"
        style="
        margin: 0;
        color: #737373;
        font-size: 13px;
        line-height: 20px;
        text-align: center;
      "
      >
        If you didn't create this account, you can safely ignore this email.
      </p>
    `
  )
