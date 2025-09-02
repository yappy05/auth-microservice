import * as process from 'node:process';

export interface EmailConfig {
  transport: {
    service: string
    auth: {
      user: string;
      pass: string;
    };
  };
  defaults: {
    from: string;
  }
}

export const emailConfig = (): EmailConfig => ({
  transport: {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    }
  },
  defaults: {
    from: `"My App" <${process.env.GMAIL_USER}>`
  }
})
