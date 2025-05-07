import React, { useEffect, useState } from 'react';
import './CartPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Alert from '../../components/Alert/Alert';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [alertType, setAlertType] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectAll, setSelectAll] = useState(true);

  const toggleSelectAll = async () => {
    const token = localStorage.getItem('token');

    const updated = await Promise.all(cartItems.map(async (item) => {
      await fetch(`https://api.surtte.com/cart/${item.id}/check`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isChecked: selectAll }),
      });
      return { ...item, isChecked: selectAll };
    }));

    setCartItems(updated);
    setSelectAll(!selectAll);
  };


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
    const unitPrice = price / 12;
    return unitPrice * item.quantity;
  };

  const calculateProviderTotal = (items) =>
    items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  
  const calculateTotalGlobal = () =>
    cartItems.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  const handleRequestByProvider = async (providerId, items) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
    const userId = usuario.id;
  
    const checkedItems = items.filter((item) => item.isChecked);
    if (checkedItems.length === 0) {
      setAlertType('error');
      setAlertMessage('Selecciona al menos un producto para este proveedor.');
      setShowAlert(true);
      return;
    }
  
    const orderItems = checkedItems.map((item) => ({
      productId: item.product.id,
      productName: item.productNameSnapshot,
      quantity: item.quantity,
      unity: 'unidad',
      unitPrice: parseFloat(getApplicablePrice(item)?.price || '0'),
      color: item.colorSnapshot,
      size: item.sizeSnapshot,
      imageSnapshot: item.imageUrlSnapshot,
    }));
  
    const totalPrice = orderItems.reduce((sum, item) => sum + (item.unitPrice / 12) * item.quantity, 0);
  
    try {
      const res = await fetch('https://api.surtte.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          providerId,
          totalPrice,
          items: orderItems,
          notes: 'Hola, he colocado un pedido desde la tienda.',
        }),
      });
  
      if (!res.ok) throw new Error('Error al crear el pedido');
  
      for (const item of checkedItems) {
        await fetch(`https://api.surtte.com/cart/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      setCartItems((prev) =>
        prev.filter((item) => item.providerId !== providerId || !item.isChecked)
      );
  
      setAlertType('success');
      setAlertMessage('Orden agregada con éxito.');
      setShowAlert(true);
    } catch (err) {
      console.error('Error al solicitar el pedido:', err);
      setAlertType('error');
      setAlertMessage('Hubo un error al crear el pedido.');
      setShowAlert(true);
    }
  };
  
  

  const handleRequestAll = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
    const userId = usuario.id;
  
    try {
      for (const [provider, items] of Object.entries(grouped)) {
        const checkedItems = items.filter((item) => item.isChecked);
        if (checkedItems.length === 0) continue;

        console.log(provider);
  
        const providerId = checkedItems[0].product.providerId;
  
        const orderItems = checkedItems.map((item) => ({
          productId: item.product.id,
          productName: item.productNameSnapshot,
          quantity: item.quantity,
          unity: 'unidad',
          unitPrice: parseFloat(getApplicablePrice(item)?.price || '0'),
          color: item.colorSnapshot,
          size: item.sizeSnapshot,
          imageSnapshot: item.imageUrlSnapshot,
        }));
  
        const totalPrice = orderItems.reduce((sum, item) => sum + (item.unitPrice / 12) * item.quantity, 0);
  
        const res = await fetch('https://api.surtte.com/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            providerId,
            totalPrice,
            items: orderItems,
            notes: 'Hola, he colocado un pedido desde la tienda.',
          }),
        });
  
        if (!res.ok) throw new Error('Error al crear el pedido');
  
        for (const item of checkedItems) {
          await fetch(`https://api.surtte.com/cart/${item.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
  
      setCartItems((prev) => prev.filter((item) => !item.isChecked));
      setAlertType('success');
      setAlertMessage('Orden agregada con éxito.');
      setShowAlert(true);
    } catch (err) {
      console.error('Error al crear pedidos:', err);
      setAlertType('error');
      setAlertMessage('Hubo un error al crear el pedido.');
      setShowAlert(true);
    }
  };
  
  
  if (loading) return <p>Cargando carrito...</p>;

  return (
    <>
      {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(null)}
            redirectTo={alertType === 'success' ? '/' : null}
          />
      )}
      <Header />
      <div className="cart-page">
          
          <div className="request-all">
            <div className="total-global">
              <p>Total general</p>
              <div className='prices-shower'>
                <h1>COP</h1>
                <h2>{calculateTotalGlobal().toLocaleString('es-CO')}</h2>
              </div>
            </div>
            <p>Ordenar todos los pedidos de todos los proveedores</p>
            <button className="request-all-btn" onClick={handleRequestAll}>
              Solicitar todos los pedidos
            </button>
          </div>

          <button className='trash-all-btn' onClick={toggleSelectAll}>
            {selectAll ? 'Seleccionar todo' : 'No seleccionar nada'}
          </button>

        {Object.entries(grouped).map(([provider, items]) => (
          <fieldset key={provider} className="provider-group">
            <legend>{provider}</legend>
            {items.map((item) => {
              const applicablePrice = getApplicablePrice(item);
              const unitPrice = parseFloat(applicablePrice?.price || 0);
              return (
                <div key={item.id} className={`cart-item ${item.isChecked ? 'checked' : ''}`}>                  
                  <div className="item-info">
                    <div className="item-image">
                      <input
                        type="checkbox"
                        className="check-product"
                        checked={item.isChecked}
                        onChange={(e) => onToggleCheck(item.id, e.target.checked)}
                      />
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
                      <p className='docena-info-cart'>Por docena</p>
                    </div>
                  </div>
                  <p className="unit-price">Unidad: ${(unitPrice / 12).toLocaleString('es-CO')}</p>
                  <p className="product-total">
                    Total: ${((unitPrice / 12) * item.quantity).toLocaleString('es-CO')}
                  </p>
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
            <button
              className="request-btn" 
              onClick={() =>
                handleRequestByProvider(items[0].product.providerId, items)
              }
            >
              Solicitar pedido para este proveedor
            </button>

          </fieldset>
        ))}
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default CartPage;
