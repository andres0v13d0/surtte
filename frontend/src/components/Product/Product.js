import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCartPlus, faPen, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import './Product.css';

const Product = ({
    uuid,
    image,
    name,
    provider,
    stars,
    prices,
    favorites,
}) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const userId = usuario?.id;
    const userEmpresa = usuario?.proveedorInfo?.nombre_empresa;
    const isOwnProduct = userEmpresa && provider && userEmpresa === provider;
    const effectiveFavorites = favorites ?? !isOwnProduct;

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch(`https://api.surtte.com/favorites/${userId}`);
                const data = await res.json();
                const exists = data.some(fav => fav.product.id === uuid);
                setIsFavorite(exists);
            } catch (err) {
                console.error('Error cargando favoritos:', err);
            }
        };

        if (effectiveFavorites && userId) {
            fetchFavorites();
        }
    }, [effectiveFavorites, uuid, userId]);

    const toggleFavorite = async (e) => {
        e.stopPropagation();

        if (!userId) return;

        try {
            if (isFavorite) {
                await fetch(`https://api.surtte.com/favorites/${userId}/${uuid}`, {
                    method: 'DELETE',
                });
                setIsFavorite(false);
            } else {
                await fetch('https://api.surtte.com/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, productId: uuid }),
                });
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Error al cambiar estado de favorito:', err);
        }
    };

    const handleClick = () => {
        const path = `/product/${uuid}`;
        navigate(path);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        sessionStorage.setItem('scrollToQuantity', 'true');
        const path = isOwnProduct ? `/edit-product/${uuid}` : `/product/${uuid}`;
        navigate(path);
    };

    const mainPrice = prices[0];

    return (
        <div className="product" onClick={handleClick}>
            {effectiveFavorites && (
                <button
                    className={`add-to-favorites-button ${isFavorite ? 'favorited' : ''}`}
                    onClick={toggleFavorite}
                    title={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
                >
                    <FontAwesomeIcon
                        icon={isFavorite ? faHeart : faHeartRegular}
                        className="heart-icon"
                    />
                </button>
            )}

            <img
                src={image}
                alt={name}
                className="product-image"
                loading="lazy"
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
                    {prices.length > 1 ? (
                        <>
                            <span className="price-more-info">+{prices.length - 1} precios disponibles</span>
                            <div className="tooltip-content">
                                {prices.slice(1).map((price, i) => (
                                    <p key={i}><strong>${price.amount}</strong> {price.condition}</p>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="price-more-info" style={{ visibility: 'hidden' }}>.</span>
                            <div className="tooltip-content" style={{ display: 'none' }}></div>
                        </>
                    )}
                </div>

                <div className='product-price-inf'>
                    <div className="product-price-highlight">
                        <p className="main-price"><span>COP</span>{mainPrice.amount}</p>
                        <p className="price-note">{mainPrice.condition}</p>
                    </div>
                    <button className="add-to-cart-button" onClick={handleAddToCartClick}>
                        <FontAwesomeIcon 
                            icon={isOwnProduct ? faPen : faCartPlus} 
                            className={isOwnProduct ? 'edit-icon' : ''}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Product;
