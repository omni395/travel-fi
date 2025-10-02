declare module 'nodemailer' {
  export interface SentMessageInfo {
    messageId: string;
    // Другие типы, если нужно
  }

  export interface Transporter {
    sendMail(mailOptions: any): Promise<SentMessageInfo>;
    // Другие методы
  }

  function createTransport(config: any): Transporter;

  export default createTransport;
}

// Базовые опции
interface SendMailOptions {
  from?: string;
  to: string;
  subject: string;
  html?: string;
  // Другие поля
}