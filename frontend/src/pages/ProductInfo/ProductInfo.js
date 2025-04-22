import React, { useState, useEffect } from 'react';
import './ProductInfo.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';

const pricesMock = [
  { amount: 70000, condition: 'por 1 unidad' },
  { amount: 50000, condition: 'por 9 o más unidades' },
  { amount: 30000, condition: 'por 3 o más docenas' },
  { amount: 20000, condition: 'por 10 o más docenas' },
];

const camiseta = "/camiseta.avif";

const ProductInfo = () => {
  const [unitType, setUnitType] = useState('units');
  const [quantity, setQuantity] = useState(1);
  const [totalUnits, setTotalUnits] = useState(1);
  const [applicablePrice, setApplicablePrice] = useState(pricesMock[0]);
  const [usedDocenaMatch, setUsedDocenaMatch] = useState(false);

  useEffect(() => {
    const convertedUnits = unitType === 'dozens' ? quantity * 12 : quantity;
    setTotalUnits(convertedUnits);

    const bestPrice = pricesMock
      .filter((p) => {
        const number = parseInt(p.condition.match(/\d+/));
        const isDozen = p.condition.includes('docena');
        const requiredUnits = isDozen ? number * 12 : number;
        return convertedUnits >= requiredUnits;
      })
      .sort((a, b) => b.amount - a.amount)[0] || pricesMock[0];

    setApplicablePrice(bestPrice);
    setUsedDocenaMatch(bestPrice.condition.includes('docena'));
  }, [quantity, unitType]);


  return (
    <>
      <Header />
      <div className="product-container">
        <div className="product-image-section">
          <div className="thumbnail-container">
            <img src={camiseta} alt="thumb" className="thumbnail" />
            <img src={camiseta} alt="thumb" className="thumbnail" />
            <img src={camiseta} alt="thumb" className="thumbnail" />
          </div>
          <img src={camiseta} alt="Producto" className="main-image" />
        </div>

        <div className="product-details">
          <h2 className="product-title">Camiseta Oficial Colombia Hombre - Amarilla 2024</h2>
          <p className="product-description">Demuestra tu pasión por la Tricolor con la camiseta oficial de la Selección Colombia 2024 para hombre. Confeccionada en tela liviana y transpirable, ideal para alentar en la cancha o lucir con orgullo.</p>
          <div className="line"></div>
          <div className="dynamic-price-highlight">
            <h3><b>COP</b>{applicablePrice.amount.toLocaleString()}</h3>
          </div>
          <p className='p-info-prices'>Este producto tiene precios escalonados según la cantidad. Mira las tarifas disponibles:</p>
          <div className="price-scroll-list">
            {pricesMock.map((price, i) => (
              <div key={i} className={`price-block ${price.condition === applicablePrice.condition ? 'active' : ''}`}>
                <p className="price-amount">COP {price.amount.toLocaleString()} c/u</p>
                <p className="price-condition">{price.condition}</p>
              </div>
            ))}
          </div>

          <div className="selectors">
            <div className="unit-selector">
              <label>Unidad:</label>
              <select value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                <option value="units">Unidades</option>
                <option value="dozens">Docenas</option>
              </select>
            </div>

            <div className="quantity-selector">
              <label>Cantidad:</label>
              <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {unitType === 'units' && usedDocenaMatch && (totalUnits % 12 === 0) && (
            <p className="warning-text">💡 Podrías ahorrar más si seleccionas "Docenas" en vez de "Unidades".</p>
          )}
        
        
         <button className="add-to-cart">Añadir al carrito</button>
         <div className="line"></div>

          <div className="product-provider-info">
            <h1>Información del proveedor</h1>
            <p className='p-name-provider'>Distribuciones el Paisa</p>
            <p className='p-calf-provider'><strong>Calificación: </strong>⭐ ⭐ ⭐ ⭐ ⭐ </p>
            <p className='p-desc-provider'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vehicula vitae orci id vestibulum. Phasellus mollis molestie ante nec venenatis. Sed in urna sed lectus elementum scelerisque.</p>
          </div>
          <div className="line"></div>
          <h2 className="more-products-title">Más productos del proveedor</h2>
        </div>
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default ProductInfo;