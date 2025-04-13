import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faPlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './AddProduct.css';

const AddProduct = () => {
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [prices, setPrices] = useState([]);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState('right');
    const [priceBlocks, setPriceBlocks] = useState([{ id: Date.now() }]);

    const handleAddPriceBlock = () => {
        if (priceBlocks.length < 3) {
            setPriceBlocks([...priceBlocks, { id: Date.now() + Math.random() }]);
        }
    };
    
    const handleRemovePriceBlock = (id) => {
        setPriceBlocks(priceBlocks.filter(block => block.id !== id));
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + images.length > 6) {
            alert('Puedes subir hasta 6 imágenes máximo.');
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
                                    <>
                                        <div key={index} className="preview-box">
                                            <img src={src} alt={`preview-${index}`} />
                                            <FontAwesomeIcon icon={faCircleXmark} className="delete-icon" onClick={() => {
                                                setPreviews(previews.filter((_, i) => i !== index));
                                                setImages(images.filter((_, i) => i !== index));
                                            }} />
                                        </div>
                                    </>
                                ))}

                                {images.length < 6 && (
                                    <>
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
                                        <div className="preview-box empty">
                                            
                                        </div>
                                    </>                                    
                                )}

                            </div>
                            <button
                                type="button"
                                className={images.length % 2 !== 0 ? 'number-image' : ''}
                                onClick={() => goToStep(1)}
                            >
                                Siguiente
                            </button>
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
                            <label>Nombre del producto</label>
                            <input
                                type="text"
                                value={productName}
                                maxLength={50}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Ej: Vestido floral de verano para mujer"
                            />
                            <p className="input-length">
                                <b>Caracteres:</b> {productName.length} / 50
                            </p>
                            <label>Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) =>    setDescription(e.target.value)}
                                maxLength={200}
                                placeholder="Ej: Vestido casual con estampado floral, ideal para días soleados. Tela ligera y fresca. Disponible en varias tallas y colores."
                            />
                            <p className="input-length">
                                <b>Caracteres:</b> {description.length} / 200
                            </p>
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
                            {priceBlocks.map((block, index) => (
                                <div key={block.id}>
                                    <fieldset className="price-fieldset">
                                    <label>Cantidad</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 9 o más unidades, 1 a 3 docenas"
                                        onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddPrice(e.target.value);
                                            e.target.value = '';
                                        }
                                        }}
                                    />
                                    <label>Precio</label>
                                    <div className="price-input">
                                        <span className="currency-symbol">COP</span>
                                        <input
                                        type="number"
                                        placeholder="Ej: 50.000"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                            handleAddPrice(e.target.value);
                                            e.target.value = '';
                                            }
                                        }}
                                        />
                                    </div>
                                    </fieldset>

                                    {priceBlocks.length > 1 && (
                                    <button
                                        type="button"
                                        className="add-price delete"
                                        onClick={() => handleRemovePriceBlock(block.id)}
                                    >
                                        Eliminar
                                    </button>
                                    )}
                                </div>
                            ))}

                            {priceBlocks.length < 3 && (
                                <button
                                    type="button"
                                    className="add-price"
                                    onClick={handleAddPriceBlock}
                                >
                                    Agregar precio
                                </button>
                            )}
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