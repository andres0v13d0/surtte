import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationPurpose } from '../entities/notification-log.entity';
import { getWhatsAppTemplatePayload } from './whatsapp.templates';
import axios from 'axios';

@Injectable()
export class WhatsappService {
    private readonly apiUrl = 'https://graph.facebook.com/v18.0';
    private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // ID de número en Meta
    private readonly token = process.env.WHATSAPP_TOKEN; // Token del sistema

    async send(
        purpose: NotificationPurpose,
        to: string, // debe incluir +57
        data: Record<string, any>,
    ): Promise<{ success: boolean; responseDetails?: any }> {
        try {
            const payload = getWhatsAppTemplatePayload(purpose, to, data);

            const response = await axios.post(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return {
                success: true,
                responseDetails: response.data,
            };
        } catch (err) {
            console.error('[WhatsAppService] Error:', err.response?.data || err.message);
            return {
                success: false,
                responseDetails: err.response?.data || err.message,
            };
        }
    }
}
