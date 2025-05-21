import React, { useState, useEffect } from 'react';
import './OrderInfo.css';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Footer from '../../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronLeft, faMoneyBill, faShop, faUser } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import secureAxios from '../../utils/secureAxios';
import Alert from '../../components/Alert/Alert';
import Loader from '../../components/Loader/Loader';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

const OrderInfo = () => {
    const { uuid } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showProviderDetails, setShowProviderDetails] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await secureAxios.get(`/orders/${uuid}`);
                setOrder(data);
            } catch (err) {
                console.error('Error al obtener la orden:', err);
                setError('Error al cargar la orden.');
            }
        };
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchOrder();
            }
        });

        return () => unsubscribe();
    }, [uuid]);

    if (error) {
        return (
            <>
                <Header minimal={true} searchBar={true} backOn={true} />
                <div className="order-container">
                    <Alert message={error} type="error" />
                </div>
                <NavInf />
                <Footer />
            </>
        );
    }

    if (!order) {
        return (
            <>
                <Header minimal={true} searchBar={true} backOn={true} />
                <Loader />
                <NavInf />
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header minimal={true} searchBar={true} backOn={true} />
            <div className="order-container">
                <h2 className='order-num'>Orden #{order.id}</h2>
                <div className='line order'></div>

                <div className='order-status'>
                    <div className='info-status'>
                        <p><strong>Estado:</strong></p>
                        <p><strong>●</strong>{{
                            pending: "Pendiente",
                            processing: "En proceso",
                            delivered: "Entregado",
                            canceled: "Cancelado"
                        }[order.status] || order.status}</p>

                    </div>
                    <p className='date-update'><strong>Última Actualización:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                </div>

                <div className='line'></div>

                {/* Detalles del cliente */}
                <div className="order-details-wrapper">
                    <button className="toggle-button" onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
                        <div>
                            <FontAwesomeIcon icon={faUser} />
                            <p>{order.customer?.nombre || 'Cliente'}</p>
                        </div>
                        <FontAwesomeIcon className='icon-details' icon={showCustomerDetails ? faChevronDown : faChevronLeft} />
                    </button>

                    <div className={`order-details ${showCustomerDetails ? 'open' : 'closed'}`}>
                        {order.customer ? (
                            <>
                                <p>{order.customer.direccion}</p>
                                <p>{order.customer.ciudad}</p>
                                <p>{order.customer.departamento}</p>
                            </>
                        ) : (
                            <p>Dirección no registrada</p>
                        )}
                        <p>+57 {order.customer.celular}</p>
                    </div>
                </div>

                <div className='space'></div>

                <h3 className='quantity-product-d'>{order.items.length} artículos</h3>
                <div className="order-items">
                    {order.items.map((item) => (
                        <div key={item.id} className="order-item-card">
                            <img src={item.imageSnapshot} alt={item.productName} />
                            <div className='item-info-cont'>
                                <div className='item-order-info'>
                                    <p>{item.productName}</p>
                                    <p>{Number(item.unitPrice).toLocaleString('es-CO', { maximumFractionDigits: 0 }) || '—'} </p>
                                </div>
                                <div className='item-order-info'>
                                    <p className='info-variants'>
                                        {item.color && <span>Color: {item.color}</span>}
                                        {item.color && item.size && ' / '}
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
                    <p><strong>{(Math.floor(Number(order.totalPrice) / 100) * 100).toLocaleString('es-CO') || '—'}</strong></p>
                </div>

                <div className="order-details-wrapper">
                    <button className="toggle-button" onClick={() => setShowProviderDetails(!showProviderDetails)}>
                        <div>
                            <FontAwesomeIcon icon={faShop} />
                            <p>{order.provider?.nombre_empresa || 'Proveedor'}</p>
                        </div>
                        <FontAwesomeIcon className='icon-details' icon={showProviderDetails ? faChevronDown : faChevronLeft} />
                    </button>

                    <div className={`order-details ${showProviderDetails ? 'open' : 'closed'}`}>
                        <p><strong>Calificación:</strong> {order.provider.calificacion}</p>

                    </div>
                </div>

                <div className='space'></div>
            </div>
            <NavInf />
            <Footer />
        </>
    );
};

export default OrderInfo;
