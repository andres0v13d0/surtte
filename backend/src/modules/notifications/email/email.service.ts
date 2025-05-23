import {
    Injectable,
} from '@nestjs/common';
import {
    SESClient,
    SendEmailCommand,
} from '@aws-sdk/client-ses';
import { NotificationPurpose } from '../entities/notification-log.entity';
import { getEmailTemplate } from './email.templates';

@Injectable()
export class EmailService {
    private sesClient = new SESClient({
        region: 'us-east-1',
    });

    async send(
        purpose: NotificationPurpose,
        to: string,
        data: Record<string, any>,
    ): Promise<{ success: boolean; responseDetails?: any }> {
        try {
            const template = getEmailTemplate(purpose, data); // Te devuelve { subject, html }

            const params = {
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: template.html,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: template.subject,
                    },
                },
                Source: `SURTTE <notificaciones@surtte.com>`,
            };

            const command = new SendEmailCommand(params);
            const response = await this.sesClient.send(command);

            return {
                success: true,
                responseDetails: response,
            };
        } catch (err) {
            console.error('📧 Error SES:', err);
            return {
                success: false,
                responseDetails: err.message || err,
            };
        }
    }
}
