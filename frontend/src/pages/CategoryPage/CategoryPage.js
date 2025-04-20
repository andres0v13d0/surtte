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
        params.append('subCategorySlug', subCategorySlug);
      }

      if (categorySlug) {
        params.append('categorySlug', categorySlug);
      }

      const url = `https://api.surtte.com/products/filter/slug?${params.toString()}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
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
