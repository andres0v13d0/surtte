import { Injectable } from '@nestjs/common';
import * as mercadopago from 'mercadopago';

@Injectable()
export class MercadoPagoService {
    constructor() {
        mercadopago.configure({
            access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
        });
    }

    async createPreference({
        amount,
        planName,
        providerEmail,
        externalReference,
    }: {
        amount: number;
        planName: string;
        providerEmail: string;
        providerId: number;
        externalReference: string;
    }) {
        const baseUrl = process.env.FRONTEND_BASE_URL;
        const preference = await mercadopago.preferences.create({
        items: [
            {
                title: `${providerEmail} - Pago Plan ${planName} - $${amount}`,
                quantity: 1,
                unit_price: +amount,
            },
        ],
        payer: {
            email: providerEmail,
        },
        external_reference: externalReference,
        back_urls: {
            success: `${baseUrl}/planes/success`,
            pending: `${baseUrl}/planes/pending`,
            failure: `${baseUrl}/planes/failure`,
        },
        auto_return: 'approved',
        });

        return {
            id: preference.body.id,
            init_point: preference.body.init_point,
        };
    }

    async getPaymentStatusById(mercadoPagoId: string) {
        const payment = await mercadopago.payment.findById(+mercadoPagoId);
        const { status, transaction_amount, external_reference } = payment.body;

        return {
            status,
            amount: transaction_amount,
            external_reference,
        };
    }
}
