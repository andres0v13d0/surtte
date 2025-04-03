import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const Product = () => {
    return (
        <div className="product">
            <img 
                src="/camiseta.avif" 
                alt="Product" 
                className="product-image" 
            />
            <h2 className="product-title">Título del Producto</h2>
            <p className="product-name">Nombre del Producto</p>
            <div className="product-rating">
                {[...Array(5)].map((_, index) => (
                    <FontAwesomeIcon key={index} icon={faStar} className="star-icon" />
                ))}
            </div>
            <div className="product-prices">
                <p className="product-price">Precio: $42.00</p>
                <p className="product-price">Precio: $45.00</p>
                <p className="product-price">Precio: $50.00</p>
            </div>
            <button className="add-to-cart-button">Añadir al Carrito</button>
        </div>
    );
};

export default Product;