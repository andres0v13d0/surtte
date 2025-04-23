import React from 'react';
import './CartPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CartPage = () => {
  const dummyItems = [
    {
      id: 1,
      providerName: 'Tienda Oviedo',
      productName: 'Lorem ipsum dolor sit amet, consectetur tincidunt.', 
      price: 50000,
      unitType: 'unidades',
      quantity: 2,
      imageUrl: '/camiseta.avif'
    },
    {
      id: 2,
      providerName: 'Tienda Oviedo',
      productName: 'Camiseta amarilla 50 años Selección Colombia',
      price: 30000,
      unitType: 'docenas',
      quantity: 1,
      imageUrl: '/camiseta.avif'
    },
    {
      id: 3,
      providerName: 'Diverso Sports',
      productName: 'Camiseta amarilla 50 años Selección Colombia',
      price: 20000,
      unitType: 'unidades',
      quantity: 1,
      imageUrl: '/camiseta.avif'
    },
    {
      id: 4,
      providerName: 'Diverso Sports',
      productName: 'Camiseta amarilla 50 años Selección Colombia',
      price: 30000,
      unitType: 'docenas',
      quantity: 1,
      imageUrl: '/camiseta.avif'
    },
  ];

  const cartItems = dummyItems;

  const onUpdateItem = (id, field, value) => {
    console.log(`Actualizar item ${id}: ${field} -> ${value}`);
  };

  const onRequestOrder = (provider) => {
    console.log(`Solicitar pedido a: ${provider}`);
  };

  const onRequestAll = () => {
    console.log('Solicitar todos los pedidos');
  };

  const groupedByProvider = cartItems.reduce((acc, item) => {
    if (!acc[item.providerName]) acc[item.providerName] = [];
    acc[item.providerName].push(item);
    return acc;
  }, {});

  const calculateSubtotal = (item) => {
    const multiplier = item.unitType === 'docenas' ? 12 : 1;
    return item.price * item.quantity * multiplier;
  };

  const calculateProviderTotal = (items) => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const allProviders = Object.keys(groupedByProvider);

  return (
    <>
      <Header />
      <div className="cart-page">
        {allProviders.length > 1 && (
            <div className="request-all">
              <div className="total-global">
                <p>Total general</p>
                <div className='prices-shower'>
                  <h1>COP</h1>
                  <h2>{allProviders
                    .reduce((sum, provider) => sum + calculateProviderTotal(groupedByProvider[provider]), 0)
                    .toFixed(2)}</h2>
                </div>
              </div>
              <p>Ordenar todos los pedidos de todos los proveedores</p>
              <button className="request-all-btn" onClick={onRequestAll}>
                Solicitar todos los pedidos
              </button>
            </div>
        )}
        <div className='line'></div>
        <div className='orders-cont'>
          {allProviders.map((provider) => {
              const items = groupedByProvider[provider];
              const total = calculateProviderTotal(items);
              return (
              <fieldset key={provider} className="provider-group">
                  <legend>{provider}</legend>
                  {items.map((item) => (
                  <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <div className="item-image">
                          <img src={item.imageUrl} alt={item.productName} />
                        </div>
                        <div className="item-details">
                          <span className="product-name">{item.productName}</span>
                          <span className="product-price"><p>COP</p>{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="item-controls">
                        <select
                            value={item.unitType}
                            onChange={(e) => onUpdateItem(item.id, 'unitType', e.target.value)}
                        >
                            <option value="unidades">Unidades</option>
                            <option value="docenas">Docenas</option>
                        </select>
                        <select
                            value={item.quantity}
                            onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                        >
                            {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <FontAwesomeIcon id='item-delete' icon={faTrash} onClick={() => console.log(`Eliminar item ${item.id}`)} />
                      </div>
                  </div>
                  ))}
                  <div className="provider-total">Subtotal <p>COP</p> <h1>{total.toFixed(2)}</h1></div>
                  <button className="request-btn" onClick={() => onRequestOrder(provider)}>Solicitar pedido</button>
              </fieldset>
              );
          })}
        </div>
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default CartPage;