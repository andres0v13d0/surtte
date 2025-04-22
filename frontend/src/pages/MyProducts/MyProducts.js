import { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';
import './MyProducts.css';
import { useNavigate } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

        const res = await fetch(`https://api.surtte.com/products/by-provider/${user.proveedorInfo.id}`);
        const data = await res.json();

        // Mapear estructura al formato esperado por el componente <Product />
        const parsed = await Promise.all(data.map(async (prod) => {
          // Obtener imágenes
          const imgRes = await fetch(`https://api.surtte.com/images/by-product/${prod.id}`);
          const images = await imgRes.json();

          // Obtener precios
          const priceRes = await fetch(`https://api.surtte.com/product-prices/product/${prod.id}`);
          const prices = await priceRes.json();

          return {
            uuid: prod.id,
            name: prod.name,
            provider: user.proveedorInfo.nombre_empresa,
            stars: 5,
            image: images[0]?.imageUrl || "/default.jpg",
            prices: prices.map(p => ({
              amount: parseFloat(p.pricePerUnit).toLocaleString('es-CO', {
                minimumFractionDigits: 0
              }),
              condition: p.minQuantity
            }))
          };
        }));

        setProductos(parsed);
      } catch (err) {
        console.error("Error al obtener productos del proveedor:", err);
      }
    };

    fetchProductos();
  }, []);

  const addProduct = () => {
    navigate("/add-product");
  };

  return (
    <>
      <Header />
      <div className='products-cont'>
        {productos.map((prod, index) => (
          <Product key={index} {...prod} />
        ))}
        <div className='products-add' onClick={addProduct}>
          <div className='add-button'>
            <FontAwesomeIcon icon={faPlus} />
          </div>
        </div>
      </div>
      <NavInf selected={"profile"} />
      <Footer />
    </>
  );
}

export default MyProducts;
