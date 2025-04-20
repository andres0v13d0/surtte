import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Product from '../../components/Product/Product';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';

const CategoryPage = () => {
  const [products, setProducts] = useState([]);
  const { categoryId, subCategoryId } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId && !subCategoryId) return;
      const params = new URLSearchParams();
  
      if (subCategoryId) {
        params.append('subCategoryId', subCategoryId);
      }
  
      if (categoryId) {
        params.append('categoryId', categoryId);
      }
  
      const url = `https://api.surtte.com/products/filter?${params.toString()}`;
  
      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error cargando productos', err);
      }
    };
  
    fetchProducts();
  }, [categoryId, subCategoryId]);
  

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
