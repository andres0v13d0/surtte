import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './ProductInfo.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';

const ProductInfo = () => {
  const { uuid } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [prices, setPrices] = useState([]);
  const [provider, setProvider] = useState(null);
  const [unitType, setUnitType] = useState('units');
  const [quantity, setQuantity] = useState(1);
  const [totalUnits, setTotalUnits] = useState(1);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const unitRef = useRef(null);
  const quantityRef = useRef(null);

  useEffect(() => {
    const shouldScroll = sessionStorage.getItem('scrollToQuantity') === 'true';
    if (shouldScroll && product && prices.length > 0) {
      setTimeout(() => {
        if (unitRef.current && quantityRef.current) {
          unitRef.current.classList.add('highlight-quantity');
          quantityRef.current.classList.add('highlight-quantity');
          unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          sessionStorage.removeItem('scrollToQuantity');
          setTimeout(() => {
            unitRef.current?.classList.remove('highlight-quantity');
            quantityRef.current?.classList.remove('highlight-quantity');
          }, 3000);
        }
      }, 100);
    }
  }, [product, prices]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`https://api.surtte.com/products/${uuid}`);
        const productData = await productRes.json();
        setProduct(productData);
        setColors(productData.colors || []);
        setSizes(productData.sizes || []);

        const [imgRes, priceRes] = await Promise.all([
          fetch(`https://api.surtte.com/images/by-product/${uuid}`),
          fetch(`https://api.surtte.com/product-prices/product/${uuid}`)
        ]);
        const imagesData = await imgRes.json();
        const pricesData = await priceRes.json();
        setImages(imagesData);
        setMainImage(imagesData?.[0]?.imageUrl || '/camiseta.avif');
        setPrices(pricesData);

        const defaultPrice = pricesData.find(p => p.unity === 'unidad') || pricesData[0];
        setUnitType(defaultPrice.unity === 'docena' ? 'dozens' : 'units');
        setQuantity(defaultPrice.minQuantity || 1);

        const providerRes = await fetch(`https://api.surtte.com/providers/public/${productData.provider.id}`);
        const providerData = await providerRes.json();
        setProvider(providerData);

        const relatedRes = await fetch(`https://api.surtte.com/products/by-provider/${productData.provider.id}`);
        const relatedData = await relatedRes.json();

        setRelatedProducts(relatedData.filter(p => p.id !== productData.id));
      } catch (err) {
        console.error('Error cargando datos del producto:', err);
      }
    };

    fetchData();
  }, [uuid]);

  const availableQuantities = useMemo(() => {
    const allQuantities = new Set();
    prices.filter(p => p.unity === (unitType === 'dozens' ? 'docena' : 'unidad'))
      .forEach(p => {
        const min = p.minQuantity;
        const max = p.maxQuantity;
        for (let i = min; i <= max; i++) {
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

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión para agregar al carrito.');
        return;
      }
      const res = await fetch('https://api.surtte.com/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          unitType,
          quantity,
          priceSnapshot: parseFloat(applicablePrice?.price || 0),
        }),
      });
      if (!res.ok) throw new Error('No se pudo agregar al carrito');
      alert('Producto agregado al carrito exitosamente ✅');
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      alert('Ocurrió un error al agregar al carrito 😓');
    }
  };

  if (!product || !provider || !applicablePrice) return <p>Cargando...</p>;

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
            <h3><b>COP</b>{parseFloat(applicablePrice?.price || 0).toLocaleString('es-CO')}</h3>
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

          <div className="line"></div>
          <h2 className="more-products-title">Más productos del proveedor</h2>
          <div className='products-cont'>
            {relatedProducts.map((prod, index) => (
              <Product key={index} {...prod} />
            ))}
          </div>
        </div>
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default ProductInfo;