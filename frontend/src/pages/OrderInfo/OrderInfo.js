import React, { useState } from 'react';
import './OrderInfo.css';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Footer from '../../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronLeft, faMoneyBill, faShop, faUser } from '@fortawesome/free-solid-svg-icons';
import ListProducts from '../../components/ListProducts/ListProducts';

const mockOrder = {
  id: 1001,
  status: 'En proceso',
  totalPrice: 149.99,
  shippingAddress: 'Av. Siempre Viva 742, Springfield',
  notes: 'Entregar solo en horario laboral',
  createdAt: '2025-05-17T10:15:00',
  updatedAt: '2025-05-17T12:00:00',
  user: {
    nombre: 'Jonathan Oviedo',
    email: 'oviedojonathan2001@gmail.com',
  },
  provider: {
    nombre: 'Proveedor Ejemplo',
    email: 'proveedor@surtte.com',
  },
  items: [
    {
      id: 'item1',
      productId: 'p1',
      productName: 'Camiseta Negra',
      quantity: 2,
      unity: 'unidad',
      unitPrice: 25.00,
      color: 'Negro',
      size: 'M',
      imageSnapshot: '/camiseta.avif',
    },
    {
      id: 'item2',
      productId: 'p2',
      productName: 'Pantalón Jeans',
      quantity: 1,
      unity: 'unidad',
      unitPrice: 99.99,
      color: 'Azul',
      size: '32',
      imageSnapshot: '/camiseta.avif',
    },
  ],
};

const OrderInfo = () => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <>
        <Header minimal={true} searchBar={true} backOn={true}/>
        <div className="order-container">
            <h2 className='order-num'>Orden #{mockOrder.id}</h2>
            
            <div className='line order'></div>

            <div className='order-status'>
                <div className='info-status'>
                    <p><strong>Estado:</strong></p>
                    <p><strong>●</strong>{mockOrder.status}</p>
                </div>
                <p className='date-update'><strong>Última Actualización:</strong> {new Date(mockOrder.updatedAt).toLocaleString()}</p>
            </div>

            <div className='line'></div>

            <div className="order-details-wrapper">
                <button
                    className="toggle-button"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    <div>
                        <FontAwesomeIcon icon={faUser} />
                        <p> {mockOrder.user.nombre}</p>
                    </div>
                    <FontAwesomeIcon className='icon-details' icon={showDetails ? faChevronDown : faChevronLeft} />
                </button>

                <div className={`order-details ${showDetails ? 'open' : 'closed'}`}>
                    <p>{mockOrder.shippingAddress}</p>
                    <p>{mockOrder.notes || 'Sin notas'}</p>
                    <p>{mockOrder.user.email}</p>
                    <p>+573101234567</p>
                </div>
            </div>

            <div className='space'></div>

            <h3 className='quantity-product-d'>{mockOrder.items.length} artículos</h3>
            <div className="order-items">
                {mockOrder.items.map((item) => (
                    <div key={item.id} className="order-item-card">
                        <img src={item.imageSnapshot} alt={item.productName} />
                        <div className='item-info-cont'>
                            <div className='item-order-info'>
                                <p>{item.productName}</p>
                                <p>${item.unitPrice}</p>
                            </div>
                            <div className='item-order-info'>
                                <p className='info-variants'>
                                    {item.color && <span>Color: {item.color}</span>}
                                    /
                                    {item.size && <span>Talla: {item.size}</span>}
                                </p>
                                <p>x{item.quantity} {item.unity}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='space'></div> 

            <div className='order-total-price'>
                <div>
                    <FontAwesomeIcon icon={faMoneyBill} />
                    <p>Monto total a pagar</p>
                </div>
                <p><strong>${mockOrder.totalPrice}</strong></p>
            </div>

            <div className="order-details-wrapper">
                <button
                    className="toggle-button"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    <div>
                        <FontAwesomeIcon icon={faShop} />
                        <p>{mockOrder.provider.nombre}</p>
                    </div>
                    <FontAwesomeIcon className='icon-details' icon={showDetails ? faChevronDown : faChevronLeft} />
                </button>

                <div className={`order-details ${showDetails ? 'open' : 'closed'}`}>
                    <p><strong>Calificación: </strong>⭐⭐⭐⭐⭐</p>
                    <p>{mockOrder.provider.email}</p>
                    <p>+573101234567</p>
                </div>
            </div>
            <div className='space'></div>
        </div>
        <ListProducts />
        <NavInf />
        <Footer />
    </>
  );
};

export default OrderInfo;
