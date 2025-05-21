import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Order from '../../components/Order/Order';
import './OrdersPage.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { secureFetch } from '../../utils/secureFetch';

function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await secureFetch('https://api.surtte.com/orders/my-provider', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const pedidosFormateados = data.map((order) => {
          const cantidadProductos = order.items.reduce((total, item) => total + item.quantity, 0);

          return {
            id: order.id,
            status: order.status,
            total: order.totalPrice.toLocaleString('es-CO', { minimumFractionDigits: 0 }),
            cantidad: cantidadProductos,
            images: order.items.slice(0, 4).map(item => item.imageSnapshot || '/default.jpg'),
          };
        });

        setOrders(pedidosFormateados);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    };

    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchOrders();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header
        minimal={true}
        providerName={JSON.parse(localStorage.getItem('usuario'))?.proveedorInfo?.nombre_empresa}
        menuProvider={true}
        currentPage='orders'
      />
      <button className='new-order-btn' onClick={() => window.location.href = '/nueva-orden'}>
        Crear orden
      </button>
      <div className="orders-page">
        {orders.map((order) => (
          <Order key={order.id} {...order} />
        ))}
      </div>
      <NavInf />
      <Footer />
    </>
  );
}

export default OrdersPage;
