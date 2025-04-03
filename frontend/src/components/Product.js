import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import './Product.css'; 

const Product = ({
    image,
    name,
    provider,
    stars,
    prices,
}) => {
    
    const mainPrice = prices[0];

    return (
        <div className="product">
            <img 
                src={image}
                alt={name}
                className="product-image" 
            />
            <div className='product-info'>
                <p className="product-name">{name}</p>

                <div className="product-rating">
                    <span className="rating-text">{provider}</span>
                    {[...Array(stars)].map((_, index) => (
                        <FontAwesomeIcon key={index} icon={faStar} className="star-icon" />
                    ))}
                </div>

                <div className="product-price-highlight">
                    <p className="main-price">COP {mainPrice.amount}</p>
                    <p className="price-note">Aplica {mainPrice.condition}</p>

                    <div className="tooltip-wrapper">
                        <span className="price-more-info">+{prices.length - 1} precios disponibles</span>
                        <div className="tooltip-content">
                        {prices.slice(1).map((price, i) => (
                            <p key={i}><strong>${price.amount}</strong> {price.condition}</p>
                        ))}
                        </div>
                    </div>
                </div>

                <button className="add-to-cart-button">Añadir al carrito</button>
            </div>
        </div>
    );
};

export default Product;
