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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const items = await res.json();

        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const pricesRes = await fetch(`https://api.surtte.com/product-prices/product/${item.product.id}`);
            const prices = await pricesRes.json();

            let minUnits = Infinity;
            let minDozens = Infinity;
            prices.forEach((p) => {
              const match = p.minQuantity?.match(/\d+/);
              if (match) {
                const num = parseInt(match[0]);
                if (p.minQuantity.toLowerCase().includes('unidad')) {
                  minUnits = Math.min(minUnits, num);
                } else if (p.minQuantity.toLowerCase().includes('docena')) {
                  minDozens = Math.min(minDozens, num);
                }
              }
            });

            const initialUnitType = item.unitType;
            const quantity = item.quantity;
            const totalUnits = initialUnitType === 'dozens' ? quantity * 12 : quantity;

            const applicablePrice = prices
              .filter((p) => {
                const match = p.minQuantity?.match(/\d+/);
                if (!match) return false;
                const number = parseInt(match[0]);
                const isDozen = p.minQuantity.toLowerCase().includes('docena');
                const requiredUnits = isDozen ? number * 12 : number;
                return totalUnits >= requiredUnits;
              })
              .sort((a, b) => parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit))[0];

            return {
              ...item,
              price: parseFloat(applicablePrice?.pricePerUnit || '0'),
              prices,
              unitType: initialUnitType,
              quantity,
            };
          })
        );

        setCartItems(enrichedItems);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el carrito:', err);
      }
    };

    fetchCart();
  }, []);

  const onUpdateItem = async (id, field, value) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    const updatedItem = cartItems.find((item) => item.id === id);
    const newUnitType = field === 'unitType' ? value : updatedItem.unitType;
    const newQuantity = field === 'quantity' ? value : updatedItem.quantity;
    const totalUnits = newUnitType === 'dozens' ? newQuantity * 12 : newQuantity;

    const applicablePrice = updatedItem.prices
      .filter((p) => {
        const match = p.minQuantity?.match(/\d+/);
        if (!match) return false;
        const number = parseInt(match[0]);
        const isDozen = p.minQuantity.toLowerCase().includes('docena');
        const requiredUnits = isDozen ? number * 12 : number;
        return totalUnits >= requiredUnits;
      })
      .sort((a, b) => parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit))[0];

    const token = localStorage.getItem('token');
    await fetch(`https://api.surtte.com/cart/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity, unitType: newUnitType, price: parseFloat(applicablePrice?.pricePerUnit || '0') }
          : item
      )
    );
  };

  const onDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://api.surtte.com/cart/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error al eliminar el ítem:', err);
    }
  };

  const groupedByProvider = cartItems.reduce((acc, item) => {
    if (!acc[item.providerNameSnapshot]) acc[item.providerNameSnapshot] = [];
    acc[item.providerNameSnapshot].push(item);
    return acc;
  }, {});

  const calculateSubtotal = (item) => {
    const multiplier = item.unitType === 'dozens' ? 12 : 1;
    return item.price * item.quantity * multiplier;
  };

  const calculateProviderTotal = (items) => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const allProviders = Object.keys(groupedByProvider);

  if (loading) return <p>Cargando carrito...</p>;

  const solicitarPedidoPorProveedor = async (providerId, items) => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const token = localStorage.getItem('token');
      const senderId = usuario.id;
  
      await fetch('https://api.surtte.com/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId,
          receiverId: providerId,
          message: 'Hola, quiero solicitar un pedido de su tienda.',
          messageType: 'TEXT',
        }),
      });
  
      for (const item of items) {
        const productMessage = {
          type: 'PRODUCT',
          name: item.productNameSnapshot,
          quantity: item.quantity,
          imageUrl: item.imageUrlSnapshot,
        };
  
        await fetch('https://api.surtte.com/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderId,
            receiverId: providerId,
            message: JSON.stringify(productMessage),
            messageType: 'TEXT',
          }),
        });
  
        await fetch(`https://api.surtte.com/cart/${item.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
  
      setCartItems((prev) => prev.filter((item) => item.providerId !== providerId));
      navigate('/messages');
    } catch (err) {
      console.error('Error al solicitar el pedido:', err);
      alert('Hubo un error al solicitar el pedido.');
    }
  };
  
  const onRequestAll = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
    const senderId = usuario.id;
  
    try {
      for (const provider of allProviders) {
        const items = groupedByProvider[provider];
        const providerId = items[0].product.providerId;
  
        await fetch('https://api.surtte.com/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderId,
            receiverId: providerId,
            message: 'Hola, quiero solicitar un pedido de su tienda.',
            messageType: 'TEXT',
          }),
        });
  
        for (const item of items) {
          const productMessage = {
            type: 'PRODUCT',
            name: item.productNameSnapshot,
            quantity: item.quantity,
            imageUrl: item.imageUrlSnapshot,
          };
  
          await fetch('https://api.surtte.com/chat/message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              senderId,
              receiverId: providerId,
              message: JSON.stringify(productMessage),
              messageType: 'TEXT',
            }),
          });
  
          await fetch(`https://api.surtte.com/cart/${item.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
  
      setCartItems([]);
      navigate("/messages");
    } catch (err) {
      console.error('Error al solicitar todos los pedidos:', err);
      alert('Hubo un error al solicitar todos los pedidos.');
    }
  };  

  return (
    <>
      <Header />
      <div className="cart-page">
        {allProviders.length >= 1 && (
          <div className="request-all">
            <div className="total-global">
              <p>Total general</p>
              <div className='prices-shower'>
                <h1>COP</h1>
                <h2>{allProviders
                  .reduce((sum, provider) => sum + calculateProviderTotal(groupedByProvider[provider]), 0)
                  .toLocaleString('es-CO', { minimumFractionDigits: 0 })}</h2>
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
                        <img src={item.imageUrlSnapshot} alt={item.productNameSnapshot} />
                      </div>
                      <div className="item-details">
                        <span className="product-name">{item.productNameSnapshot}</span>
                        <span className="product-price"><p>COP</p>{item.price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                    <div className="item-controls">
                      <select
                        value={item.unitType}
                        onChange={(e) => onUpdateItem(item.id, 'unitType', e.target.value)}
                      >
                        <option value="units">Unidades</option>
                        <option value="dozens">Docenas</option>
                      </select>
                      <select
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                      >
                        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <FontAwesomeIcon id='item-delete' icon={faTrash} onClick={() => onDeleteItem(item.id)} />
                    </div>
                  </div>
                ))}
                <div className="provider-total">Subtotal <p>COP</p> <h1>{total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</h1></div>
                <button 
                  className="request-btn" 
                  onClick={() => solicitarPedidoPorProveedor(items[0].product.providerId, items)}
                >
                  Solicitar pedido
                </button>
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
