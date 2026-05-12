import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import {
  clearPasswordResetToken,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByResetToken,
  findUserByVerificationToken,
  markUserEmailVerified,
  setPasswordResetToken,
  updateUserNeonColor,
  updateUserPassword
} from '../models/userModel.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export async function register(req, res, next) {
  try {
    const { nombre, email, password, neon_color } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son obligatorios' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await createUser({
      nombre,
      email,
      passwordHash,
      neonColor: neon_color,
      emailVerified: 0,
      verificationToken,
      verificationExpires
    });

    try {
      await sendVerificationEmail({ nombre, email }, verificationToken);
    } catch (mailError) {
      console.error('Error sending verification email:', mailError.message);
      return res.status(500).json({
        message: 'No se pudo enviar el email de verificación. Inténtalo de nuevo más tarde.'
      });
    }

    return res.status(201).json({
      message: 'Registro completado. Revisa tu email para verificar tu cuenta.',
      user
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ message: 'Debes verificar tu email antes de iniciar sesión.' });
    }

    const publicUser = await findUserById(user.id);
    return res.json({ user: publicUser, token: signToken(publicUser) });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email obligatorio.' });
    }

    const genericMessage =
      'Si el email existe, enviaremos instrucciones para restablecer la contraseña.';

    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await setPasswordResetToken(user.id, resetToken, resetExpires);

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (mailError) {
      console.error('Error sending password reset email:', mailError.message);
    }

    return res.json({ message: genericMessage });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token de recuperación obligatorio.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'La password debe tener al menos 6 caracteres.' });
    }

    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'El enlace no es válido o ha caducado.' });
    }

    if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ message: 'El enlace no es válido o ha caducado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, passwordHash);
    await clearPasswordResetToken(user.id);

    return res.json({
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { neon_color } = req.body;

    if (!neon_color) {
      return res.status(400).json({ message: 'neon_color es obligatorio' });
    }

    const user = await updateUserNeonColor(req.user.id, neon_color);
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token de verificación obligatorio.' });
    }

    const user = await findUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ message: 'El token de verificación no es válido.' });
    }

    if (!user.verification_expires || new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ message: 'El token de verificación ha caducado.' });
    }

    const verifiedUser = await markUserEmailVerified(user.id);
    return res.json({
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
      user: verifiedUser
    });
  } catch (err) {
    next(err);
  }
}
