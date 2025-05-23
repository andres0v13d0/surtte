import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../components/Loader/Loader';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processPayment = async () => {
      const wompiPaymentId = searchParams.get('id'); // nuevo ID de Wompi
      const env = searchParams.get('env');
      const localPaymentId = localStorage.getItem('lastPaymentId'); // nuestro ID interno

      if (wompiPaymentId && localPaymentId) {
        try {
          const token = localStorage.getItem('token');

          console.log('✅ Confirmando pago con:', {
            wompiPaymentId,
            localPaymentId,
            env,
          });

          await axios.post('https://api.surtte.com/payments/mark-success', {
            mercadoPagoId: wompiPaymentId, // reusamos el campo, aunque es Wompi
            paymentId: localPaymentId,
            status: 'approved', // siempre 'approved' si llegó aquí
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        } catch (error) {
          console.error('❌ Error al confirmar pago:', error);
        } finally {
          localStorage.removeItem('lastPaymentId');
          setTimeout(() => navigate('/plans'), 1500);
        }
      } else {
        setTimeout(() => navigate('/plans'), 1500);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return <Loader />;
}
