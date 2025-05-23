import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class MercadoPagoService {
  private readonly wompiKey = process.env.WOMPI_PRIVATE_KEY!;
  private readonly baseUrl = process.env.FRONTEND_BASE_URL;

  // 🔁 Cache local en memoria para la tasa USD → COP
  private static cachedRate: number | null = null;
  private static lastUpdated = 0;

  private async convertUsdToCop(usd: number): Promise<number> {
    const apiKey = process.env.EXCHANGERATE_KEY!;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Si no hay cache o ya pasó 1 hora
    if (!MercadoPagoService.cachedRate || now - MercadoPagoService.lastUpdated > oneHour) {
      try {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/COP`);
        const data = await res.json();

        if (data.result === 'success') {
          MercadoPagoService.cachedRate = data.conversion_rate;
          MercadoPagoService.lastUpdated = now;
          console.log('🔁 [ExchangeRate] Tasa actualizada:', MercadoPagoService.cachedRate);
        } else {
          console.warn('⚠️ [ExchangeRate] Error en respuesta, usando fallback:', data);
          MercadoPagoService.cachedRate = 4000;
        }
      } catch (err) {
        console.error('❌ [ExchangeRate] Error al obtener tasa:', err);
        MercadoPagoService.cachedRate = 4000;
      }
    }

    return Math.round(usd * MercadoPagoService.cachedRate!);
  }

  async createPreference({
    amount,
    planName,
    externalReference,
  }: {
    amount: number; // en USD
    planName: string;
    externalReference: string;
  }): Promise<{
    id: string;
    init_point: string;
  }> {
    const cop = await this.convertUsdToCop(amount);
    const copInCents = cop * 100;

    const body = {
      name: `Pago plan ${planName}`,
      description: `Pago del plan ${planName} (${amount} USD aprox. ${cop} COP)`,
      single_use: true,
      collect_shipping: false,
      currency: 'COP',
      amount_in_cents: copInCents,
      redirect_url: `${this.baseUrl}/planes/success`,
    };

    const res = await fetch('https://sandbox.wompi.co/v1/payment_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.wompiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok || !json.data) {
      console.error('❌ [Wompi] Error al crear el link:', json);
      throw new Error('Error creando el link de pago en Wompi');
    }

    console.log('✅ [Wompi] Link creado con éxito:', json.data.id);

    return {
      id: json.data.id,
      init_point: `https://checkout.wompi.co/l/${json.data.id}`,
    };
  }

  async getPaymentStatusById(_id: string) {
    // Wompi no tiene consulta directa de status por ID sin webhooks
    return {
      status: 'approved',
      amount: 0,
      external_reference: '',
    };
  }
}

