export function buildVerifyCodeTemplate(to: string, data: { code: string }) {
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: 'verificacion_codigo',
      language: { code: 'es_CO' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.code },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: data.code } // 🔁 cualquier URL válida
          ]
        }
      ],
    },
  };
}

