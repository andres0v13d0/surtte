import React from 'react';
import './Order.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const statusLabels = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  canceled: 'Cancelado',
};

const Order = ({ id, status, total, cantidad, images }) => {
  const navigate = useNavigate();

  return (
    <div className="order-card" onClick={() => navigate(`/order/${id}`)}>
        
        
        <div className="order-header">
            <div className='order-time'>
                <p className='order-date'>
                    {new Date().toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                </p>
                <p className='order-hour'>
                    {new Date().toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
            <span className={`order-status ${status}`}>{statusLabels[status] || status}</span>
        </div>

        <h3 className='order-num'>Pedido #{id}</h3>

        <p className='order-client'>
            Cliente: <span>Nombre del Cliente</span>
        </p>

        <div className='order-items'>
            <div className="order-images-wrapper">
                <div className="order-images">
                {[...Array(10)].map((_, index) => (
                    <img key={index} src={images[0]} alt={`Producto ${index + 1}`} />
                ))}
                </div>
            </div>

            <div className="order-quantity">
                <p>COP {parseFloat(total).toLocaleString('es-CO')}</p>
                <p>{cantidad} productos</p>
            </div>
            <button className="order-button">
                <FontAwesomeIcon icon={faChevronRight} className="order-icon" />
            </button>
        </div>
    </div>
  );
};

export default Order;
