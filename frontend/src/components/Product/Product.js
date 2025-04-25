import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import './Product.css'; 

const Product = ({
    uuid,
    image,
    name,
    provider,
    stars,
    prices,
}) => {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/product/${uuid}`);
    };

    const handleAddToCartClick = (e) => {
        sessionStorage.setItem('scrollToQuantity', 'true');
        navigate(`/product/${uuid}`);
    };
    
    const mainPrice = prices[0];

    return (
        <div className="product" onClick={handleClick}>
            <img 
                src={image}
                alt={name}
                className="product-image" 
            />
            <div className='product-info'>
                <p className="product-name">{name}</p>

                <div className="product-rating">
                    {[...Array(stars)].map((_, index) => (
                        <FontAwesomeIcon key={index} icon={faStar} className="star-icon" />
                    ))}
                    <span className="rating-text">{provider}</span>
                </div>

                <div className="tooltip-wrapper">
                    <span className="price-more-info">+{prices.length - 1} precios disponibles</span>
                    <div className="tooltip-content">
                    {prices.slice(1).map((price, i) => (
                        <p key={i}><strong>${price.amount}</strong> {price.condition}</p>
                    ))}
                    </div>
                </div>

                <div className='product-price-inf'>
                    <div className="product-price-highlight">
                        <p className="main-price"><span>COP</span>{mainPrice.amount}</p>
                        <p className="price-note">Aplica {mainPrice.condition}</p>
                    </div>
                    <button className="add-to-cart-button" onClick={handleAddToCartClick}>
                        <FontAwesomeIcon icon={faCartPlus} />
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default Product;
