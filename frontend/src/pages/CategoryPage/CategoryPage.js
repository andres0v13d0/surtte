import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Product from '../../components/Product/Product';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';

const CategoryPage = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`https://api.surtte.com/products/filter?categoryId=dummy&subCategoryId=${id}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };

    fetchProducts();
  }, [id]);

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
