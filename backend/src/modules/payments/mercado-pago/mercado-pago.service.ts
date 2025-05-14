import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class MercadoPagoService {
    private readonly accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
    private readonly baseUrl = process.env.FRONTEND_BASE_URL;

    async createPreference({
        amount,
        planName,
    }: {
        amount: number;
        planName: string;
    }) {
        const body = {
            items: [
                {
                    title: `Pago Plan ${planName}`,
                    quantity: 1,
                    unit_price: +amount,
                    currency_id: 'USD',
                }
            ],
            back_urls: {
                success: `${this.baseUrl}/planes/success`,
                pending: `${this.baseUrl}/planes/pending`,
                failure: `${this.baseUrl}/planes/failure`,
            },
            auto_return: 'approved',
        };

        console.log('📤 [MercadoPago] Enviando preferencia de pago:');
        console.dir(body, { depth: null });

        const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const preference = await res.json();

        console.log('✅ [MercadoPago] Preferencia creada:');
        console.log('➡️ init_point:', preference.init_point);
        console.log('➡️ ID:', preference.id);
        console.dir(preference, { depth: null });

        return {
            id: preference.id,
            init_point: preference.init_point,
        };
    }

    async getPaymentStatusById(mercadoPagoId: string) {
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${mercadoPagoId}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        });

        const payment = await res.json();

        console.log('🔍 [MercadoPago] Verificando estado del pago:');
        console.log('➡️ ID:', mercadoPagoId);
        console.dir(payment, { depth: null });

        return {
            status: payment.status,
            amount: payment.transaction_amount,
            external_reference: payment.external_reference,
        };
    }
}
