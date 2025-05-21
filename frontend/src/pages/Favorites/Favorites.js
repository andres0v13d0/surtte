import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';
import './Favorites.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { secureFetch } from '../../utils/secureFetch';

function Favorites() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      const userId = JSON.parse(localStorage.getItem('usuario'))?.id;
      if (!userId) return;

      try {
        const res = await secureFetch(`https://api.surtte.com/favorites/${userId}`);
        const data = await res.json();

        const productosFormateados = await Promise.all(
          data.map(async (fav) => {
            const prod = fav.product;

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
                  amount: parseFloat(p?.pricePerUnit || '0').toLocaleString('es-CO', {
                    minimumFractionDigits: 0
                  }),
                  condition: p?.minQuantity ?? 'Sin condición'
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
        console.error('Error al cargar favoritos:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchFavoritos();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <div className='products-cont'>
        {products.length > 0 ? (
          products.map((prod, index) => (
            <Product key={index} {...prod} />
          ))
        ) : (
          <p style={{ padding: '1rem', textAlign: 'center' }}>No tienes productos favoritos aún.</p>
        )}
      </div>
      <NavInf selected={"favorites"} />
      <Footer />
    </>
  );
}

export default Favorites;
