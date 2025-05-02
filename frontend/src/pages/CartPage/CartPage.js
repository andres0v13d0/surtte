import React, { useEffect, useState } from 'react';
import './CartPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://api.surtte.com/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = await res.json();

        const enriched = await Promise.all(
          items.map(async (item) => {
            const pricesRes = await fetch(`https://api.surtte.com/product-prices/product/${item.product.id}`);
            const prices = await pricesRes.json();

            return { ...item, prices };
          })
        );

        setCartItems(enriched);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el carrito:', err);
      }
    };

    fetchCart();
  }, []);

  const onUpdateQuantity = async (id, quantity) => {
    const token = localStorage.getItem('token');
    await fetch(`https://api.surtte.com/cart/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const onToggleCheck = async (id, isChecked) => {
    const token = localStorage.getItem('token');
    await fetch(`https://api.surtte.com/cart/${id}/check`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isChecked }),
    });
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isChecked } : item))
    );
  };

  const onDeleteItem = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`https://api.surtte.com/cart/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const onClearCart = async () => {
    const token = localStorage.getItem('token');
    await fetch('https://api.surtte.com/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCartItems([]);
  };

  const grouped = cartItems.reduce((acc, item) => {
    const prov = item.providerNameSnapshot || 'Proveedor desconocido';
    if (!acc[prov]) acc[prov] = [];
    acc[prov].push(item);
    return acc;
  }, {});

  const getApplicablePrice = (item) => {
    return item.prices.find((p) => {
      const qList = p.quantity?.split(',').map((q) => parseInt(q.trim()));
      return qList?.includes(item.quantity);
    });
  };

  const calculateSubtotal = (item) => {
    const price = parseFloat(getApplicablePrice(item)?.price || '0');
    return price * item.quantity;
  };

  const calculateProviderTotal = (items) =>
    items.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  const handleRequestAll = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    for (const [provName, items] of Object.entries(grouped)) {
      const receiverId = items[0].product.providerId;

      await fetch('https://api.surtte.com/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          senderId: usuario.id,
          receiverId,
          message: 'Hola, quiero solicitar un pedido de su tienda.',
          messageType: 'TEXT',
        }),
      });

      for (const item of items) {
        const msg = {
          type: 'PRODUCT',
          name: item.productNameSnapshot,
          quantity: item.quantity,
          imageUrl: item.imageUrlSnapshot,
        };

        await fetch('https://api.surtte.com/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            senderId: usuario.id,
            receiverId,
            message: JSON.stringify(msg),
            messageType: 'TEXT',
          }),
        });

        await fetch(`https://api.surtte.com/cart/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }

    setCartItems([]);
    navigate('/messages');
  };

  if (loading) return <p>Cargando carrito...</p>;

  return (
    <>
      <Header />
      <div className="cart-page">
        {Object.keys(grouped).length > 0 && (
          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={onClearCart}>
              <FontAwesomeIcon icon={faTrash} /> Vaciar carrito
            </button>
            <button className="request-all-btn" onClick={handleRequestAll}>
              Solicitar todos los pedidos
            </button>
          </div>
        )}

        {Object.entries(grouped).map(([provider, items]) => (
          <fieldset key={provider} className="provider-group">
            <legend>{provider}</legend>
            {items.map((item) => {
              const applicablePrice = getApplicablePrice(item);
              const unitPrice = parseFloat(applicablePrice?.price || 0);
              return (
                <div key={item.id} className={`cart-item ${item.isChecked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    className="check-product"
                    checked={item.isChecked}
                    onChange={(e) => onToggleCheck(item.id, e.target.checked)}
                  />
                  <div className="item-info">
                    <div className="item-image">
                      <img src={item.imageUrlSnapshot} alt={item.productNameSnapshot} />
                    </div>
                    <div className="item-details">
                      <span className="product-name">{item.productNameSnapshot}</span>
                      <p className="product-variant">
                        Talla: {item.sizeSnapshot || 'N/A'} | Color: {item.colorSnapshot || 'N/A'}
                      </p>
                      <div className="tooltip-wrapper">
                        {item.prices.length > 1 ? (
                          <>
                            <span className="price-more-info">+{item.prices.length - 1} precios</span>
                            <div className="tooltip-content">
                              {item.prices.slice(1).map((p, i) => (
                                <p key={i}><strong>${parseFloat(p.price).toLocaleString('es-CO')}</strong> {p.description}</p>
                              ))}
                            </div>
                          </>
                        ) : (
                          <span className="price-more-info" style={{ visibility: 'hidden' }}>.</span>
                        )}
                      </div>
                      <span className="product-price">
                        <p>COP</p>{unitPrice.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                      </span>
                      {item.quantity % 12 === 0 && (
                        <p className="unit-price">Unidad: ${(unitPrice / 12).toLocaleString('es-CO')}</p>
                      )}
                      <p className="product-total">Total: ${(unitPrice * item.quantity).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                  <div className="item-controls">
                    <select
                      className="quantity-selector"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
                    >
                      {[...new Set(item.prices.flatMap(p => p.quantity?.split(',') || []))]
                        .map(q => q.trim()).filter(q => q).map((q, i) => (
                          <option key={i} value={parseInt(q)}>{q}</option>
                      ))}
                    </select>
                    <FontAwesomeIcon id="item-delete" icon={faTrash} onClick={() => onDeleteItem(item.id)} />
                  </div>
                </div>
              );
            })}
            <div className="provider-total">
              Subtotal: COP {calculateProviderTotal(items).toLocaleString('es-CO')}
            </div>
          </fieldset>
        ))}
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default CartPage;
