import { NotificationPurpose } from '../entities/notification-log.entity';
import { buildVerifyCodeTemplate } from '../templates/whatsapp/verify-code.template';
import { buildNewOrderTemplate } from '../templates/whatsapp/pedido-recibido.template';

export function getWhatsAppTemplatePayload(
    purpose: NotificationPurpose,
    to: string,
    data: Record<string, any>,
) {
    switch (purpose) {
        case NotificationPurpose.VERIFY_PHONE:
            return buildVerifyCodeTemplate(to, data as { code: string });

        case NotificationPurpose.NEW_ORDER:
            return buildNewOrderTemplate(to, data as {
                proveedor: string;
                cliente: string;
                orden: string;
                url: string;
            })


        default:
            throw new Error(`No hay plantilla registrada para el propósito: ${purpose}`);
    }
}
