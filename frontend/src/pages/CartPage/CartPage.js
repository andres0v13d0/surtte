import React, { useEffect, useState } from 'react';
import './CartPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const onRequestAll = () => {
    console.log('Solicitar todos los pedidos');
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
                <button className="request-btn" onClick={() => console.log(`Solicitar pedido a: ${provider}`)}>Solicitar pedido</button>
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
