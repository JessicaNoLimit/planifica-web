import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.mail.host || !env.mail.user || !env.mail.pass || !env.mail.from) {
    throw new Error('La configuración de correo no está completa.');
  }

  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass
    }
  });

  return transporter;
}

export async function sendVerificationEmail(user, token) {
  const mailer = getTransporter();
  const verificationLink = `${env.frontendUrl}/verify-email?token=${token}`;

  await mailer.sendMail({
    from: env.mail.from,
    to: user.email,
    subject: 'Verifica tu cuenta en Planifica',
    text: [
      `Hola ${user.nombre},`,
      'Gracias por registrarte en Planifica.',
      'Para activar tu cuenta, verifica tu email usando este enlace:',
      verificationLink,
      'Este enlace caduca en 24 horas.',
      'Si no has creado esta cuenta, ignora este correo.'
    ].join('\n\n')
  });
}

export async function sendPasswordResetEmail(user, token) {
  const mailer = getTransporter();
  const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;

  await mailer.sendMail({
    from: env.mail.from,
    to: user.email,
    subject: 'Restablece tu contraseña en Planifica',
    text: [
      `Hola ${user.nombre},`,
      'Hemos recibido una solicitud para restablecer tu contraseña.',
      'Puedes crear una nueva contraseña usando este enlace:',
      resetLink,
      'Este enlace caduca en 1 hora.',
      'Si no has solicitado este cambio, ignora este correo.'
    ].join('\n\n')
  });
}
