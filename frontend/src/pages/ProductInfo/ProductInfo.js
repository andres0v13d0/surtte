// ...resto de imports
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ProductInfo.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
// import Product from '../../components/Product/Product'; // 🔴 No se usa ahora

const ProductInfo = () => {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [prices, setPrices] = useState([]);
  const [provider, setProvider] = useState(null);
  const [unitType, setUnitType] = useState('units');
  const [quantity, setQuantity] = useState(1);
  const [totalUnits, setTotalUnits] = useState(1);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const unitRef = useRef(null);
  const quantityRef = useRef(null);

  useEffect(() => {
    const mockProduct = {
      id: '1234',
      name: 'Camiseta Oficial Colombia',
      description: 'Camiseta original de la selección Colombia 2024',
      colors: [{ name: 'Amarillo' }, { name: 'Blanco' }],
      sizes: [{ name: 'S' }, { name: 'M' }, { name: 'L' }],
      provider: { id: 'prov1' }
    };

    const mockImages = [
      { imageUrl: '/camiseta.avif' },
      { imageUrl: '/camiseta2.avif' }
    ];

    const mockPrices = [
      { id: 'p1', price: '60000', minQuantity: 1, maxQuantity: 5, unity: 'unidad', description: '1 a 5 unidades' },
      { id: 'p2', price: '55000', minQuantity: 6, maxQuantity: 11, unity: 'unidad', description: '6 a 11 unidades' },
      { id: 'p3', price: '50000', minQuantity: 12, maxQuantity: 99, unity: 'unidad', description: '12 o más unidades' },
      { id: 'p4', price: '580000', minQuantity: 1, maxQuantity: 5, unity: 'docena', description: '1 a 5 docenas' }
    ];

    const mockProvider = {
      nombre_empresa: 'Surtte Colombia',
      calificacion: 4.8,
      descripcion: 'Proveedor oficial de ropa deportiva en Colombia.'
    };

    setProduct(mockProduct);
    setImages(mockImages);
    setPrices(mockPrices);
    setMainImage(mockImages[0].imageUrl);
    setColors(mockProduct.colors);
    setSizes(mockProduct.sizes);
    setProvider(mockProvider);
    setQuantity(mockPrices[0].minQuantity);
    setUnitType(mockPrices[0].unity === 'docena' ? 'dozens' : 'units');
  }, []);

  const availableQuantities = useMemo(() => {
    const allQuantities = new Set();
    prices
      .filter(p => p.unity === (unitType === 'dozens' ? 'docena' : 'unidad'))
      .forEach(p => {
        for (let i = p.minQuantity; i <= p.maxQuantity; i++) {
          allQuantities.add(i);
        }
      });
    return Array.from(allQuantities).sort((a, b) => a - b);
  }, [unitType, prices]);

  useEffect(() => {
    const units = unitType === 'dozens' ? quantity * 12 : quantity;
    setTotalUnits(units);
  }, [quantity, unitType]);

  const applicablePrice = useMemo(() => {
    return prices
      .filter(p => p.unity === (unitType === 'dozens' ? 'docena' : 'unidad'))
      .filter(p => totalUnits >= p.minQuantity && totalUnits <= p.maxQuantity)
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0] || prices[0];
  }, [totalUnits, unitType, prices]);

  const handleAddToCart = () => {
    alert(`Simulación: producto "${product.name}" agregado al carrito con ${quantity} ${unitType === 'dozens' ? 'docenas' : 'unidades'}.`);
  };

  if (!product || !provider || !applicablePrice) return <p>Cargando diseño...</p>;

  return (
    <>
      <Header />
      <div className="product-container">
        <div className="product-image-section">
          {images.length > 1 && (
            <div className="thumbnail-container">
              {images.map((img, i) => (
                <img key={i} src={img.imageUrl} alt={`thumb-${i}`} className={`thumbnail ${mainImage === img.imageUrl ? 'selected' : ''}`} onClick={() => setMainImage(img.imageUrl)} />
              ))}
            </div>
          )}
          <img src={mainImage} alt="Producto" className="main-image" />
        </div>

        <div className="product-details">
          <h2 className="product-title">{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <div className="line"></div>

          <div className="dynamic-price-highlight">
            <h3><b>COP</b> {parseFloat(applicablePrice?.price || 0).toLocaleString('es-CO')}</h3>
          </div>

          <p className='p-info-prices'>Este producto tiene precios escalonados según la cantidad. Mira las tarifas disponibles:</p>
          <div className="price-scroll-list">
            {prices.map((p, i) => (
              <div key={i} className={`price-block ${p.id === applicablePrice.id ? 'active' : ''}`}>
                <p className="price-amount">COP {parseFloat(p.price).toLocaleString('es-CO')}</p>
                <p className="price-condition">{p.description}</p>
              </div>
            ))}
          </div>

          {colors.length > 0 && (
            <div className="selector-inline">
              <label>Color:</label>
              <select>
                {colors.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="selector-inline">
              <label>Talla:</label>
              <select>
                {sizes.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div className="selectors">
            <div className="unit-selector">
              <label>Unidad:</label>
              <select ref={unitRef} value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                {prices.some(p => p.unity === 'unidad') && <option value="units">Unidades</option>}
                {prices.some(p => p.unity === 'docena') && <option value="dozens">Docenas</option>}
              </select>
            </div>

            <div className="quantity-selector">
              <label>Cantidad:</label>
              <select ref={quantityRef} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
                {availableQuantities.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="add-to-cart" onClick={handleAddToCart}>Añadir al carrito</button>

          <div className="line"></div>
          <div className="product-provider-info">
            <h1>Información del proveedor</h1>
            <p className='p-name-provider'>{provider.nombre_empresa}</p>
            <p className='p-calf-provider'><strong>Calificación: </strong>⭐ {provider.calificacion}</p>
            <p className='p-desc-provider'>{provider.descripcion}</p>
          </div>

          {/* 🔒 Ocultado por ahora */}
          {/* <div className="line"></div>
          <h2 className="more-products-title">Más productos del proveedor</h2>
          <div className='products-cont'>
            {relatedProducts.map((prod, index) => (
              <Product key={index} {...prod} />
            ))}
          </div> */}
        </div>
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default ProductInfo;
