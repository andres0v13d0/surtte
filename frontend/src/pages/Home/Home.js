import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';

function Home() {
  const [products, setProducts] = useState([]);

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
              name: prod.name,
              provider: prod.provider?.nombre_empresa || 'Proveedor desconocido',
              stars: 5,
              image: images[0]?.imageUrl || '/default.jpg',
              prices: prices.map(p => ({
                amount: parseFloat(p.pricePerUnit).toLocaleString('es-CO', {
                  minimumFractionDigits: 0
                }),
                condition: p.minQuantity
              }))
            };
          })
        );

        setProducts(productosFormateados);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <>
      <Header />
      <div className='products-cont'>
        {products.map((prod, index) => (
          <Product key={index} {...prod} />
        ))}
      </div>
      <NavInf selected={"home"} />
      <Footer />
    </>
  );
}

export default Home;
