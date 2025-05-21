import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../components/Loader/Loader';

export default function PaymentStatus() {
  const { status: urlStatus } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processPayment = async () => {
      const mercadoPagoId = searchParams.get('payment_id');
      const paymentId = localStorage.getItem('lastPaymentId');

      

      if (urlStatus === 'success' && mercadoPagoId && paymentId) {
        try {
          const token = localStorage.getItem('token');

          let backendStatus = 'pending';
          if (urlStatus === 'success') backendStatus = 'approved';
          else if (urlStatus === 'failure') backendStatus = 'rejected';

          console.log('➡️ Intentando confirmar pago con:', {
            mercadoPagoId,
            paymentId,
            status: backendStatus,
          });


          await axios.post('https://api.surtte.com/payments/mark-success', {
            mercadoPagoId,
            paymentId,
            status: backendStatus,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        } catch (error) {
          console.error('Error al confirmar pago:', error);
        } finally {
          localStorage.removeItem('lastPaymentId');
          setTimeout(() => {
            navigate('/plans');
          }, 1500); // Espera breve antes de redirigir
        }
      } else {
        // Casos: pending o failure
        setTimeout(() => {
          navigate('/plans');
        }, 1500);
      }
    };

    processPayment();
  }, [urlStatus, searchParams, navigate]);

  return <Loader />;
}
