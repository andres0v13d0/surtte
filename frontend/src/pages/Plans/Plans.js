import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Plans.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Alert from '../../components/Alert/Alert'; // importa tu componente Alert

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null); // para mostrar el alert
  const location = useLocation();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('https://api.surtte.com/plans');
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error('Error al cargar los planes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (location.pathname.includes('success')) {
      setAlertConfig({
        type: 'success',
        message: '✅ ¡Pago aprobado! Espera mientras revisamos tu documentación.',
        redirectTo: '/planes',
      });
    } else if (location.pathname.includes('pending')) {
      setAlertConfig({
        type: 'info',
        message: '⏳ Tu pago está en proceso. Te notificaremos cuando se confirme.',
      });
    } else if (location.pathname.includes('failure')) {
      setAlertConfig({
        type: 'error',
        message: '❌ El pago fue rechazado o cancelado. Intenta de nuevo.',
      });
    }
  }, [location.pathname]);

  const handleBuy = async (plan) => {
    try {
      setLoadingPayment(plan.id);
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.surtte.com/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
        }),
      });

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setAlertConfig({
          type: 'error',
          message: 'Error al generar el enlace de pago.',
        });
      }
    } catch (error) {
      console.error('Error al crear preferencia:', error);
      setAlertConfig({
        type: 'error',
        message: 'Hubo un error al procesar el pago.',
      });
    } finally {
      setLoadingPayment(null);
    }
  };

  if (loading) return <p className="loading-text">Cargando planes...</p>;

  return (
    <>
      <Header minimal={true} />
      {alertConfig && (
        <Alert
          type={alertConfig.type}
          message={alertConfig.message}
          onClose={() => setAlertConfig(null)}
          redirectTo={alertConfig.redirectTo}
        />
      )}
      <div className="plans-container">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            {plan.name.toLowerCase() === 'premium' && (
              <div className="plan-badge">Popular</div>
            )}

            <div className="plan-content">
              <h2 className="plan-title">{plan.name}</h2>
              <div className="plan-price">
                <span className="amount">${Number(plan.price).toFixed(2)}</span>
                <span className="per-month">/mes</span>
              </div>
              <ul className="plan-features">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="plan-feature-item">
                    <i className="fas fa-check check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`plan-button ${plan.name.toLowerCase() === 'premium' ? 'primary' : 'outline'}`}
                onClick={() => handleBuy(plan)}
                disabled={loadingPayment === plan.id}
              >
                {loadingPayment === plan.id ? 'Redirigiendo...' : 'Elegir Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
