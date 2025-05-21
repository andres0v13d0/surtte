import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../components/Loader/Loader';

export default function PaymentStatus() {
  const { status } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processPayment = async () => {
      const mercadoPagoId = searchParams.get('payment_id');
      const paymentId = localStorage.getItem('lastPaymentId');

      console.log('➡️ Intentando confirmar pago con:', {
        mercadoPagoId,
        paymentId,
        status,
      });


      if (status === 'success' && mercadoPagoId && paymentId) {
        try {
          await axios.post('https://api.surtte.com/payments/mark-success', {
            mercadoPagoId,
            paymentId,
            status: 'approved',
          });
        } catch (error) {
          console.error('Error al confirmar pago:', error);
        } finally {
          setTimeout(() => {
            navigate('/plans');
          }, 1500); // Espera breve antes de redirigir
        }
      } else {
        // Casos: pending o failure
        setTimeout(() => {
          navigate('/planes');
        }, 1500);
      }
    };

    processPayment();
  }, [status, searchParams, navigate]);

  return <Loader />;
}
