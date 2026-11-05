import { Button, EmailLayout } from '@emails/_shared'

export const WelcomeEmail = (props: { username: string; appLink: string }) =>
  EmailLayout(
    `Welcome to Rozumari, ${props.username}! Your account is ready to use.`,
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
        Welcome to Rozumari!
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
        Welcome to Rozumari! Your account has been successfully created, and
        we're excited to have you here.
      </p>

      <p
        style="
          margin: 0 0 24px;
          color: #171717;
          font-size: 16px;
          line-height: 24px;
        "
      >
        You can now sign in and start exploring everything Rozumari has to
        offer.
      </p>

      <div
        style="
          margin: 0 0 24px;
          text-align: center;
        "
      >
        ${Button({
          href: props.appLink,
          text: 'Get Started',
        })}
      </div>

      <p
        style="
          margin: 0;
          color: #737373;
          font-size: 13px;
          line-height: 20px;
          text-align: center;
        "
      >
        Thanks for joining Rozumari!
      </p>
    `
  )
