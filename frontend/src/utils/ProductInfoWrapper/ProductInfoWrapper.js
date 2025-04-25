import React from 'react';
import { useParams } from 'react-router-dom';
import ProductInfo from '../../pages/ProductInfo/ProductInfo';

const ProductInfoWrapper = () => {
  const { uuid } = useParams();
  return <ProductInfo key={uuid} />;
};

export default ProductInfoWrapper;
