import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import './AddProduct.css';

const AddProduct = () => {
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [prices, setPrices] = useState([]);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState('right');

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + images.length > 5) {
            alert('Puedes subir hasta 5 imágenes máximo.');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setImages(prev => [...prev, ...files]);
    };

    const handleAddPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (!isNaN(numericPrice)) {
            const updatedPrices = [...prices, numericPrice].sort((a, b) => b - a);
            setPrices(updatedPrices);
            console.log(direction);
        }
    };

    const goToStep = (newStep) => {
        setDirection(newStep > step ? 'right' : 'left');
        setStep(newStep);
    };

    return (
        <>
            <Header minimal={true} />
            <div className="add-product-container">
                <h2 className="add-title">Agrega tu producto</h2>
                <form className={`step-wrapper step-${step}`}>
                    {step === 0 && (
                        <div className="step slide-in">
                            <div className="step-sup">
                                <div>
                                    <h1>Paso 1 de 3</h1>
                                    <h2>Sube imágenes del producto</h2>
                                </div>
                            </div>
                            <div className="image-preview-container">
                                {previews.map((src, index) => (
                                    <div key={index} className="preview-box">
                                        <img src={src} alt={`preview-${index}`} />
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <div className="preview-box" onClick={() => document.getElementById('hidden-file-input').click()}>
                                        <span className="add-image">
                                            <FontAwesomeIcon icon={faPlus} />
                                        </span>
                                        <input
                                            id="hidden-file-input"
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            multiple
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}

                            </div>
                            <button type="button" onClick={() => goToStep(1)}>Siguiente</button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="step slide-in">
                            <div className='step-sup'>
                                <button id="btn-back" type="button" onClick={() => goToStep(0)}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <div>
                                    <h1>Paso 2 de 3</h1>
                                    <h2>Información del producto</h2>
                                </div>
                            </div>
                            <label>Nombre del producto (máx 20 palabras)</label>
                            <input
                                type="text"
                                value={productName}
                                maxLength={100}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                            <label>Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <button type="button" onClick={() => goToStep(2)}>Siguiente</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step slide-in">
                            <div className='step-sup'>
                                <button id="btn-back" type="button" onClick={() => goToStep(1)}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <div>
                                    <h1>Paso 3 de 3</h1>
                                    <h2>Precios del producto</h2>
                                </div>
                            </div>
                            <label>Agregar precio</label>
                            <input
                                type="number"
                                placeholder="Agrega un precio"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddPrice(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <ul className="price-list">
                                {prices.map((price, index) => (
                                    <li key={index}>${price.toFixed(2)}</li>
                                ))}
                            </ul>
                            <button type="submit">Guardar producto</button>
                        </div>
                    )}
                </form>
            </div>
            <Footer />
        </>
    );
};

export default AddProduct;