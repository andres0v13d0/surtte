import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';

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
        const response = await fetch(`${API_BASE_URL}/orders/pdf-preview/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('No se pudo obtener el PDF');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        setPdfUrl({ url });
        setLoading(false);
      } catch (err) {
        console.error('Error obteniendo PDF del backend:', err);
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
