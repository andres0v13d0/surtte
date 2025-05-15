import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';
import './SearchPage.css';

function SearchPage() {
  const { text } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        if (!text || text.trim() === '') {
          navigate('/');
          return;
        }

        const res = await fetch(`https://api.surtte.com/products/search/${encodeURIComponent(text.trim())}`);
        const data = await res.json();

        const productosFormateados = await Promise.all(
          data.map(async (prod) => {
            const [imagesRes, pricesRes] = await Promise.all([
              fetch(`https://api.surtte.com/images/by-product/${prod.id}`),
              fetch(`https://api.surtte.com/product-prices/product/${prod.id}`)
            ]);

            const images = await imagesRes.json();
            const prices = await pricesRes.json();

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
          })
        );

        setProducts(productosFormateados);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };

    fetchProductos();
  }, [text, navigate]);

  return (
    <>
      <Header />
      <p className='search-title'>
        Resultados de la búsqueda para <strong>"{text}"</strong>
      </p>
      <div className='products-cont'>
        {products.length > 0 ? (
          products.map((prod, index) => (
            <Product key={index} {...prod} />
          ))
        ) : (
          <p style={{ textAlign: 'center', width: '100%' }}>No se encontraron productos.</p>
        )}
      </div>
      <NavInf selected={"home"} />
      <Footer />
    </>
  );
}

export default SearchPage;
