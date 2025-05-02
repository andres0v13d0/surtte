import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ProductInfo.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import Product from '../../components/Product/Product'; // Asegúrate que este componente existe

const ProductInfo = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [prices, setPrices] = useState([]);
  const [provider, setProvider] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const quantityRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`https://api.surtte.com/products/${id}`);
        const productData = await productRes.json();
        setProduct(productData);
        setColors(productData.colors || []);
        setSizes(productData.sizes || []);

        const imagesRes = await fetch(`https://api.surtte.com/images/by-product/${id}`);
        const imagesData = await imagesRes.json();
        setImages(imagesData);
        setMainImage(imagesData?.[0]?.imageUrl || null);

        const pricesRes = await fetch(`https://api.surtte.com/product-prices/product/${id}`);
        const pricesData = await pricesRes.json();
        setPrices(pricesData);

        const firstQty = pricesData?.[0]?.quantity?.split(',')?.[0];
        if (firstQty) setQuantity(parseInt(firstQty.trim()));

        const providerRes = await fetch(`https://api.surtte.com/providers/${productData.providerId}`);
        const providerData = await providerRes.json();
        setProvider(providerData);

        const relatedRes = await fetch(`https://api.surtte.com/products/by-provider/${productData.providerId}`);
        const relatedData = await relatedRes.json();
        setRelatedProducts(relatedData.filter(p => p.id !== productData.id));
      } catch (err) {
        console.error('Error al cargar datos del producto:', err);
      }
    };

    fetchData();
  }, [id]);

  const availableQuantities = useMemo(() => {
    const set = new Set();
    prices.forEach(p => {
      p.quantity.split(',').forEach(q => set.add(parseInt(q.trim())));
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [prices]);

  const applicablePrice = useMemo(() => {
    return prices.find(p => {
      const qList = p.quantity.split(',').map(q => parseInt(q.trim()));
      return qList.includes(quantity);
    });
  }, [quantity, prices]);

  const handleAddToCart = () => {
    alert(`Simulación: producto "${product.name}" agregado al carrito con ${quantity} docenas.`);
  };

  if (!product || !provider || !applicablePrice) return <p>Cargando diseño...</p>;

  return (
    <>
      <Header searchBar={true} />
      <div className="product-container">
        <h2 className="product-title">{product.name}</h2>
        <div className="product-image-section">
          <img src={mainImage} alt="Producto" className="main-image" />
          <FontAwesomeIcon icon={faAngleLeft} className="arrow left" onClick={() => {
            const currentIndex = images.findIndex(img => img.imageUrl === mainImage);
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            setMainImage(images[newIndex].imageUrl);
          }} />
          <FontAwesomeIcon icon={faAngleRight} className="arrow right" onClick={() => {
            const currentIndex = images.findIndex(img => img.imageUrl === mainImage);
            const newIndex = (currentIndex + 1) % images.length;
            setMainImage(images[newIndex].imageUrl);
          }} />
          {images.length > 1 && (
            <div className="thumbnail-container">
              {images.map((img, i) => (
                <img key={i} src={img.imageUrl} alt={`thumb-${i}`} className={`thumbnail ${mainImage === img.imageUrl ? 'selected' : ''}`} onClick={() => setMainImage(img.imageUrl)} />
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <p className="product-description">{product.description}</p>
          <p className='p-calf-provider'><strong>Calificación: </strong>⭐ {provider.calificacion}</p>

          <div className="dynamic-price-highlight">
            <h3><b>COP</b> {parseFloat(applicablePrice?.price || 0).toLocaleString('es-CO')}</h3>
            <div className="dozens-info">
              <p className="dozenz-info-text">Docena</p>
              <div className='dozenz-unit'>
                <p className="dozenz-unit-text">Unidad</p>
                <p className="dozenz-unit-number">$ {parseFloat(applicablePrice?.price / 12 || 0).toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>

          <p className='p-info-prices'>Este producto tiene precios según la cantidad. Mira las tarifas disponibles:</p>
          <div className="price-scroll-list">
            {prices.map((p, i) => (
              <div key={i} className={`price-block ${p.id === applicablePrice.id ? 'active' : ''}`}>
                <p className="price-amount">COP {parseFloat(p.price).toLocaleString('es-CO')}</p>
                <p className="price-condition">{p.description}</p>
              </div>
            ))}
          </div>

          <div className="selectors">
            {colors.length > 0 && (
              <div className="unit-selector">
                <label>Color:</label>
                <select>
                  {colors.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            )}
            {sizes.length > 0 && (
              <div className="unit-selector">
                <label>Talla:</label>
                <select>
                  {sizes.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            )}
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
            <p className='p-desc-provider'>{provider.descripcion}</p>
          </div>

          {relatedProducts.length > 0 && (
            <>
              <div className="line"></div>
              <h2 className="more-products-title">Más productos del proveedor</h2>
              <div className='products-cont'>
                {relatedProducts.map((prod, index) => (
                  <Product key={index} {...prod} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default ProductInfo;
