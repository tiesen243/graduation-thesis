const LOGO = 'https://rozumari.vercel.app/web-app-manifest-512x512.png'

export const EmailLayout = (preview: string, children: string) => /* HTML */ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <style>
        @media (prefers-color-scheme: dark) {
          .email-background {
            background-color: #000000 !important;
          }

          .email-card {
            background-color: #0a0a0a !important;
            border-color: #242424 !important;
          }

          .email-text {
            color: #ededed !important;
          }

          .email-muted {
            color: #a3a3a3 !important;
          }
        }

        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }

          .email-card {
            border-radius: 0 !important;
            border-left: 0 !important;
            border-right: 0 !important;
          }

          .email-content {
            padding: 24px !important;
          }
        }
      </style>
    </head>

    <body
      class="email-background"
      style="
        margin: 0;
        padding: 0;
        width: 100%;
        background-color: #fafafa;
        color: #171717;
      "
    >
      <div
        style="
          display: none;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          color: transparent;
          mso-hide: all;
        "
      >
        ${preview}
      </div>

      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width: 100%;
          margin: 0;
          padding: 0;
          background-color: #fafafa;
        "
      >
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <table
              role="presentation"
              class="email-container"
              width="600"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="width: 100%; max-width: 600px; margin: 0 auto;"
            >
              <tr>
                <td align="center" style="padding: 0 0 24px 0;">
                  <img
                    src="${LOGO}"
                    alt="Rozumari"
                    width="64"
                    height="64"
                    style="
                      display: block;
                      width: 64px;
                      height: 64px;
                      margin: 0 auto;
                      border: 0;
                      outline: none;
                      text-decoration: none;
                      border-radius: 14px;
                    "
                  />
                </td>
              </tr>

              <tr>
                <td
                  class="email-card"
                  style="
                    background-color: #ffffff;
                    border: 1px solid #e4e4e4;
                    border-radius: 8px;
                    overflow: hidden;
                  "
                >
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >
                    <tr>
                      <td
                        class="email-content"
                        style="padding: 40px; color: #171717;"
                      >
                        ${children}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding: 24px 16px 0 16px;">
                  <p
                    class="email-muted"
                    style="
                      margin: 0;
                      color: #737373;
                      font-size: 12px;
                      line-height: 18px;
                      text-align: center;
                    "
                  >
                    &copy; ${new Date().getFullYear()} Rozumari. All rights
                    reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

export const Button = (props: { href: string; text: string }) => /* HTML */ `
  <a
    href="${props.href}"
    style="
      display: inline-block;
      height: 36px;
      padding: 0 10px;
      border: 1px solid transparent;
      border-radius: 8px;
      background-color: #1f42d0;
      color: #fafafa;
      font-size: 14px;
      line-height: 36px;
      font-weight: 500;
      text-align: center;
      text-decoration: none;
      white-space: nowrap;
    "
  >
    ${props.text}
  </a>
`
