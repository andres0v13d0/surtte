import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Product from '../../components/Product/Product';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';

const CategoryPage = () => {
  const [products, setProducts] = useState([]);
  const { categorySlug, subCategorySlug } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categorySlug && !subCategorySlug) return;

      const params = new URLSearchParams();

      if (subCategorySlug) {
        params.append('subCategory', subCategorySlug);
      }

      if (categorySlug) {
        params.append('category', categorySlug);
      }

      const url = `https://api.surtte.com/products/filter/slug?${params.toString()}`;

      try {
        const res = await fetch(url);
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
      } catch (err) {
        console.error('Error cargando productos por slug:', err);
      }
    };

    fetchProducts();
  }, [categorySlug, subCategorySlug]);

  return (
    <>
      <Header />
      <div className="products-cont">
        {products.map((prod, i) => (
          <Product key={i} {...prod} />
        ))}
      </div>
      <NavInf selected={"home"} />
      <Footer />
    </>
  );
};

export default CategoryPage;
