import * as fs from 'fs';
import * as path from 'path';
import * as mjml2html from 'mjml';
import { NotificationPurpose } from '../entities/notification-log.entity';

function renderMJMLTemplate(fileName: string, variables: Record<string, any>) {
  const templatePath = path.join(__dirname, '../templates/email', fileName);
  let mjml = fs.readFileSync(templatePath, 'utf8');

  // Reemplaza {{variables}} dentro del MJML
  for (const [key, value] of Object.entries(variables)) {
    mjml = mjml.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  const compiled = mjml2html(mjml);
  if (compiled.errors.length) {
    throw new Error(`Error al compilar MJML: ${compiled.errors[0].message}`);
  }

  return compiled.html;
}

export function getEmailTemplate(purpose: NotificationPurpose, data: Record<string, any>) {
  switch (purpose) {
    case NotificationPurpose.VERIFY_EMAIL:
      return {
        subject: 'Tu código de verificación - SURTTE',
        html: renderMJMLTemplate('verify-code.mjml', data),
      };

    case NotificationPurpose.NEW_ORDER:
      return {
        subject: '¡Tienes un nuevo pedido!',
        html: renderMJMLTemplate('pedido-recibido.mjml', data),
      };

    default:
      throw new Error(`Plantilla MJML no definida para el propósito: ${purpose}`);
  }
}
