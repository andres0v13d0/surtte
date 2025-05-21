import React, { useEffect, useState } from 'react';
import './Order.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase'; 
import { secureFetch } from '../../utils/secureFetch';

const statusLabels = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  canceled: 'Cancelado',
};

const API_BASE_URL = 'https://api.surtte.com';

const Order = ({ id, status, total, cantidad, images }) => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState('Cargando...');
  const [fechaHora, setFechaHora] = useState({ fecha: '', hora: '' });

  useEffect(() => {
    const fetchDatosOrden = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await secureFetch(`${API_BASE_URL}/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener la orden');
        const data = await res.json();

        const nombre = data?.customer?.nombre  || 'Cliente desconocido';
        setCliente(nombre);

        const fechaActualizada = new Date(data.updatedAt);
        setFechaHora({
          fecha: fechaActualizada.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          hora: fechaActualizada.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
          }),
        });
      } catch (error) {
        console.error(error);
        setCliente('Cliente desconocido');
      }
    };

    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDatosOrden();
      }
    });

    return () => unsubscribe();
  }, [id]);

  return (
    <div className="order-card" onClick={() => navigate(`/orden/${id}`)}>
      <div className="order-header">
        <div className='order-time'>
          <p className='order-date'>{fechaHora.fecha}</p>
          <p className='order-hour'>{fechaHora.hora}</p>
        </div>
        <span className={`order-status ${status}`}>{statusLabels[status] || status}</span>
      </div>

      <h3 className='order-num'>Pedido #{id}</h3>

      <p className='order-client'>
        Cliente: <span>{cliente}</span>
      </p>

      <div className='order-items'>
        <div className="order-images-wrapper">
          <div className="order-images">
            {images.map((img, index) => (
              <img key={index} src={img} alt={`Producto ${index + 1}`} />
            ))}
          </div>
        </div>

        <div className="order-quantity">
          <p>COP {(Math.floor(Number(total) / 100) * 100).toLocaleString('es-CO') || '—'}</p>
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
