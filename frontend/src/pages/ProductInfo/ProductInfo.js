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
  const scrollRef = useRef(null);
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
    const productosCache = {};

    const getProductoConDatos = async (id) => {
      if (productosCache[id]) return productosCache[id];

      const [imgRes, priceRes] = await Promise.all([
        fetch(`https://api.surtte.com/images/by-product/${id}`),
        fetch(`https://api.surtte.com/product-prices/product/${id}`)
      ]);

      const imgs = await imgRes.json();
      const priceList = await priceRes.json();

      productosCache[id] = { imgs, priceList };
      return productosCache[id];
    };

    const fetchData = async () => {
      try {
        const productRes = await fetch(`https://api.surtte.com/products/${uuid}`);
        const productData = await productRes.json();
        setProduct(productData);

        const { imgs: imagesData, priceList: pricesData } = await getProductoConDatos(uuid);
        setImages(imagesData);
        setMainImage(imagesData?.[0]?.imageUrl || '/camiseta.avif');
        setPrices(pricesData);
        const bestInitial = [...pricesData]
          .filter((p) => {
            if (!p?.minQuantity || typeof p.minQuantity !== 'string') return false;
            const match = p.minQuantity.match(/\d+/);
            if (!match) return false;
            return true;
          })
          .sort((a, b) => parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit))[0];

        if (bestInitial?.minQuantity?.toLowerCase().includes('docena')) {
          setUnitType('dozens');
          const match = bestInitial.minQuantity.match(/\d+/);
          if (match) setQuantity(parseInt(match[0]));
        } else {
          setUnitType('units');
          const match = bestInitial.minQuantity.match(/\d+/);
          if (match) setQuantity(parseInt(match[0]));
        }

        const providerRes = await fetch(`https://api.surtte.com/providers/public/${productData.provider.id}`);
        const providerData = await providerRes.json();
        setProvider(providerData);

        const relatedRes = await fetch(`https://api.surtte.com/products/by-provider/${productData.provider.id}`);
        const relatedData = await relatedRes.json();

        const relatedFormatted = await Promise.all(
          relatedData.filter(p => p.id !== productData.id).map(async (prod) => {
            try {
              const { imgs, priceList } = await getProductoConDatos(prod.id);

              return {
                uuid: prod.id,
                name: prod.name,
                provider: providerData?.nombre_empresa || 'Proveedor',
                stars: parseInt(providerData?.calificacion) || 5,
                image: imgs?.[0]?.imageUrl || '/default.jpg',
                prices: Array.isArray(priceList) && priceList.length > 0
                  ? priceList.map(p => ({
                      amount: parseFloat(p?.pricePerUnit || '0').toLocaleString('es-CO', { minimumFractionDigits: 0 }),
                      condition: p?.minQuantity ?? 'Sin condición'
                    }))
                  : [{ amount: '0', condition: 'Sin condición' }]
              };
            } catch {
              return null;
            }
          })
        );

        setRelatedProducts(relatedFormatted.filter(Boolean));
      } catch (err) {
        console.error('Error cargando datos del producto:', err);
      }
    };

    fetchData();
  }, [uuid]);

  const {
    unidadesDisponibles,
    docenasDisponibles,
    cantidadMinimaUnits,
    cantidadMinimaDozens
  } = useMemo(() => {
    let minUnits = Infinity;
    let minDozens = Infinity;

    const unidades = prices.some(p => p.minQuantity?.toLowerCase().includes('unidad'));
    const docenas = prices.some(p => p.minQuantity?.toLowerCase().includes('docena'));

    prices.forEach(p => {
      const match = p.minQuantity?.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (p.minQuantity.toLowerCase().includes('unidad')) {
          minUnits = Math.min(minUnits, num);
        } else if (p.minQuantity.toLowerCase().includes('docena')) {
          minDozens = Math.min(minDozens, num);
        }
      }
    });

    return {
      unidadesDisponibles: unidades,
      docenasDisponibles: docenas,
      cantidadMinimaUnits: isFinite(minUnits) ? minUnits : 1,
      cantidadMinimaDozens: isFinite(minDozens) ? minDozens : 1
    };
  }, [prices]);

  const cantidadMinimaValida = unitType === 'dozens' ? cantidadMinimaDozens : cantidadMinimaUnits;

  useEffect(() => {
    const nuevaCantidad = unitType === 'dozens' ? cantidadMinimaDozens : cantidadMinimaUnits;
    setQuantity(nuevaCantidad);
  }, [unitType, cantidadMinimaDozens, cantidadMinimaUnits]);

  useEffect(() => {
    const units = unitType === 'dozens' ? quantity * 12 : quantity;
    setTotalUnits(units);
  }, [quantity, unitType]);
  
  const applicablePrice = useMemo(() => {
    const best = prices
      .filter((p) => {
        if (!p?.minQuantity || typeof p.minQuantity !== 'string') return false;
        const match = p.minQuantity.match(/\d+/);
        if (!match) return false;
        const number = parseInt(match[0]);
        const isDozen = p.minQuantity.toLowerCase().includes('docena');
        const requiredUnits = isDozen ? number * 12 : number;
        return totalUnits >= requiredUnits;
      })
      .sort((a, b) => parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit))[0];
  
    return best || prices[0];
  }, [totalUnits, prices]);
  
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
        priceSnapshot: parseFloat(applicablePrice?.pricePerUnit || 0),
      }),
    });

    if (!res.ok) {
      throw new Error('No se pudo agregar al carrito');
    }

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
                <img
                  key={i}
                  src={img.imageUrl}
                  alt={`thumb-${i}`}
                  className={`thumbnail ${mainImage === img.imageUrl ? 'selected' : ''}`}
                  loading="lazy"
                  onClick={() => setMainImage(img.imageUrl)}
                />
              ))}
            </div>
          )}
          <img
            src={mainImage}
            alt="Producto"
            className="main-image"
            loading="lazy"
            decoding="async"
            width="300"
            height="300"
          />
        </div>

        <div className="product-details">
          <h2 className="product-title">{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <div className="line"></div>
          <div className="dynamic-price-highlight">
            <h3><b>COP</b>{parseFloat(applicablePrice?.pricePerUnit || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</h3>
          </div>
          <p className='p-info-prices'>Este producto tiene precios escalonados según la cantidad. Mira las tarifas disponibles:</p>
          <div className="price-scroll-list" ref={scrollRef}>
            {prices.map((price, i) => (
              <div
                key={i}
                className={`price-block ${
                  parseFloat(price.pricePerUnit).toFixed(0) === parseFloat(applicablePrice?.pricePerUnit || 0).toFixed(0)
                    ? 'active'
                    : ''
                }`}
              >
                <p className="price-amount">COP {parseFloat(price.pricePerUnit).toLocaleString('es-CO', { minimumFractionDigits: 0 })} c/u</p>
                <p className="price-condition">{price.minQuantity}</p>
              </div>
            ))}
          </div>

          <div className="selectors">
            <div className="unit-selector" >
              <label>Unidad:</label>
              <select ref={unitRef} value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                {unidadesDisponibles && <option value="units">Unidades</option>}
                {docenasDisponibles && <option value="dozens">Docenas</option>}
              </select>
            </div>

            <div className="quantity-selector" >
              <label>Cantidad:</label>
              <select ref={quantityRef} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
                {Array.from({ length: 20 }, (_, i) => i + cantidadMinimaValida).map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {unitType === 'units' && applicablePrice.minQuantity?.includes('docena') && (totalUnits % 12 === 0) && (
            <p className="warning-text">💡 Podrías ahorrar más si seleccionas "Docenas" en vez de "Unidades".</p>
          )}

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
