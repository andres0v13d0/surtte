import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch'; // Asegurate de tener esto instalado

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
                    currency_id: 'COP',
                }
            ],
            back_urls: {
                success: `${this.baseUrl}/planes/success`,
                pending: `${this.baseUrl}/planes/pending`,
                failure: `${this.baseUrl}/planes/failure`,
            },
            auto_return: 'approved',
        };

        const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const preference = await res.json();

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

        return {
            status: payment.status,
            amount: payment.transaction_amount,
            external_reference: payment.external_reference,
        };
    }
}
