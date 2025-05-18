import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';
import { ClipLoader } from 'react-spinners';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch('https://api.surtte.com/products/public');
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
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <>
      <Header />
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '10vh'
        }}>
          <ClipLoader color="#fa7e17" size={30} />
        </div>
      ) : (
        <div className='products-cont'>
          {products.map((prod, index) => (
            <Product key={index} {...prod} />
          ))}
        </div>
      )}
      <NavInf selected={"home"} />
      <Footer navinf={true}/>
    </>
  );
}

export default Home;
