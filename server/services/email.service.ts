import nodemailer from 'nodemailer';

type SendOptions = {
  to: string;
  subject: string;
  html: string;
};

class EmailService {
  private transporter: any;

  constructor() {
    // Конфигурация SMTP из переменных окружения
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true для 465, false для других портов
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(options: SendOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"TravelFi" <no-reply@travel-fi.com>',
        ...options,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  async sendConfirmationEmail(to: string, token: string, userName?: string): Promise<void> {
    const origin = process.env.APP_URL || 'http://localhost:3000';
    const confirmUrl = `${origin}/auth/confirm?token=${token}`;

    const subject = 'Подтвердите ваш email для TravelFi';
    const html = `
      <h1>Добро пожаловать в TravelFi!</h1>
      <p>Привет, ${userName || 'пользователь'},</p>
      <p>Пожалуйста, подтвердите ваш email, перейдя по ссылке:</p>
      <a href="${confirmUrl}">Подтвердить email</a>
      <p>Если вы не регистрировались, игнорируйте это письмо.</p>
      <p>С наилучшими пожеланиями,<br>Команда TravelFi</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  // Дополнительный метод для сброса пароля
  async sendPasswordResetEmail(to: string, token: string, userName?: string): Promise<void> {
    const origin = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/auth/reset?token=${token}`;

    const subject = 'Сброс пароля для TravelFi';
    const html = `
      <h1>Сброс пароля</h1>
      <p>Привет, ${userName || 'пользователь'},</p>
      <p>Чтобы сбросить пароль, перейдите по ссылке:</p>
      <a href="${resetUrl}">Сбросить пароль</a>
      <p>Ссылка действительна 1 час.</p>
      <p>Если вы не запрашивали, игнорируйте это.</p>
      <p>С наилучшими пожеланиями,<br>Команда TravelFi</p>
    `;

    await this.sendEmail({ to, subject, html });
  }
}

export default new EmailService();