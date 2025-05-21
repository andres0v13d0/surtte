import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';
import './MyProducts.css';
import { useNavigate } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { secureFetch } from '../../utils/secureFetch';

function MyProducts() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        if (!user?.proveedorInfo?.id) {
          alert('Solo los proveedores pueden ver sus productos.');
          return;
        }

        const res = await secureFetch(`https://api.surtte.com/products/by-provider/${user.proveedorInfo.id}`);
        const data = await res.json();

        const parsed = await Promise.all(data.map(async (prod) => {
          const imgRes = await fetch(`https://api.surtte.com/images/by-product/${prod.id}`);
          const images = await imgRes.json();

          const priceRes = await fetch(`https://api.surtte.com/product-prices/product/${prod.id}`);
          const prices = await priceRes.json();

          return {
            uuid: prod?.id || 'uuid-desconocido',
            name: prod?.name || 'Producto sin nombre',
            provider: prod?.provider?.nombre_empresa || 'Proveedor desconocido',
            stars: 5,
            image: images?.[0]?.imageUrl || '/default.jpg',
            prices: Array.isArray(prices) && prices.length > 0
              ? prices.map(p => ({
                  amount: parseFloat(p?.price || '0').toLocaleString('es-CO', {
                    minimumFractionDigits: 0
                  }),
                  condition: p?.description ?? 'Sin condición'
                }))
              : [{
                  amount: '0',
                  condition: 'Sin condición'
                }]
          };  
        }));

        setProductos(parsed);
      } catch (err) {
        console.error("Error al obtener productos del proveedor:", err);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProductos();
      }
    });

    return () => unsubscribe();
  }, []);

  const addProduct = () => {
    navigate("/add-product");
  };

  return (
    <>
      <Header 
        minimal={true}
        providerName={JSON.parse(localStorage.getItem('usuario'))?.proveedorInfo?.nombre_empresa}
        menuProvider={true}
        currentPage='products'
      />
      <div className='products-cont'>
        <div className='products-add' onClick={addProduct}>
          <div className='add-button'>
            <FontAwesomeIcon icon={faPlus} />
          </div>
        </div>
        {productos.map((prod, index) => (
          <Product key={index} {...prod} />
        ))}
      </div>
      <NavInf />
      <Footer />
    </>
  );
}

export default MyProducts;
