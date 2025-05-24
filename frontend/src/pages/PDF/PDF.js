import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import OrderPDF from '../../components/OrderPDF/OrderPDF';
import Loader from '../../components/Loader/Loader';
import axios from 'axios';

const API_BASE_URL = 'https://api.surtte.com';

const slugify = str =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const formatFecha = fecha => {
  const [day, month, year] = fecha.split('/');
  return `${year}-${month}-${day}`;
};

export default function PDF() {
  const { orderId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const generatePdf = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log(data);

        // Función para convertir imágenes remotas a base64
        const isBase64Webp = (base64) => base64.startsWith('data:image/webp');

        const convertImageToBase64 = async (url) => {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/orders/image-base64`, {
              params: { imageUrl: url },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const base64 = response.data.base64 || '';

            if (isBase64Webp(base64)) {
              console.warn('❌ Imagen sigue siendo webp (no válida para PDF):', url);
              return '';
            }

            return base64;
          } catch (error) {
            console.warn('❌ Error al convertir imagen:', url, error.response?.data || error.message);
            return '';
          }
        };

        // Convertir logo a base64
        const logoBase64 = await convertImageToBase64('https://cdn.surtte.com/solicitudes/perfil_1_11zon.webp');

        console.log('🧪 Imagen logo:', logoBase64.slice(0, 100));
        

        // Convertir imágenes de los productos
        const itemsConImagenesBase64 = await Promise.all(
          data.items.map(async (item) => {
            const imagenBase64 = item.imageSnapshot
              ? await convertImageToBase64(item.imageSnapshot)
              : '';
            return {
              imagen: imagenBase64,
              referencia: item.productCode || '',
              nombre_producto: item.productName || '',
              talla: item.size || '',
              color: item.color || '',
              cantidad: item.quantity,
              precio: item.unitPrice,
            };
          })
        );

        console.log('🧪 Primera imagen producto:', itemsConImagenesBase64[0]?.imagen?.slice(0, 100));

        const content = {
          logo: logoBase64,
          nombre_cliente: data.customer?.nombre || 'Sin nombre',
          celular: data.customer?.celular || 'Sin celular',
          direccion: [
            data.customer?.direccion,
            data.customer?.ciudad,
            data.customer?.departamento
          ].filter(Boolean).join(', ') || 'Sin dirección',
          notas: data.notes || 'Sin notas',
          orden_num: data.id,
          fecha: new Date(data.createdAt).toLocaleDateString('es-CO'),
          total: data.totalPrice,
          items: itemsConImagenesBase64,
        };

        const blob = await pdf(<OrderPDF content={content} />).toBlob();
        const url = URL.createObjectURL(blob);
        setPdfUrl({ blob, url, content, providerId: data.provider.id });
        setLoading(false);
      } catch (err) {
        console.error('Error generando el PDF:', err);
      }
    };

    generatePdf();
  }, [orderId]);

  const handleShare = async () => {
    if (!pdfUrl) return;
    setUploading(true);

    const { blob, content, providerId } = pdfUrl;
    const token = localStorage.getItem('token');
    console.log('🔐 Token:', token);
    console.log('📦 Order ID:', orderId);

    const filename = `${providerId}-${slugify(content.nombre_cliente)}-${formatFecha(content.fecha)}.pdf`;

    try {
      const signedRes = await fetch(
        `${API_BASE_URL}/orders/pdf-upload/${orderId}?mime=application/pdf&filename=${filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { signedUrl, finalUrl } = await signedRes.json();

      const buffer = await blob.arrayBuffer();
      const resUpload = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`, // 👈 Agrega esto
        },
        body: buffer,
      });

      if (!resUpload.ok) {
        const text = await resUpload.text();
        console.error('❌ Error al subir a S3:', resUpload.status, text);
        throw new Error('Upload failed');
      }


      const message = `Hola ${content.nombre_cliente}, aquí tienes tu pedido: ${finalUrl}`;
      const whatsappUrl = `https://wa.me/57${content.celular}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Error compartiendo el PDF:', err);
      alert('Ocurrió un error al compartir el PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <iframe
            src={pdfUrl.url}
            title="Vista previa PDF"
            style={{ width: '100%', height: '100%' }}
          />
          <button
            onClick={handleShare}
            disabled={uploading}
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              background: '#001634',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {uploading ? 'Compartiendo...' : 'Compartir'}
          </button>
        </>
      )}
    </div>
  );
}
