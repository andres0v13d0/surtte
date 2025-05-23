export function buildNewOrderTemplate(
  to: string,
  data: { proveedor: string; cliente: string; orden: string; url: string },
) {
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: 'nuevo_pedido_proveedor',
      language: { code: 'es_ES' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.proveedor },
            { type: 'text', text: data.cliente },
            { type: 'text', text: data.orden },
            { type: 'text', text: data.url },
          ],
        },
      ],
    },
  };
}
