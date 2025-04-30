import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Alert from '../Alert/Alert'; 

const InputImages = ({ images, previews, setImages, setPreviews, goToStep }) => {
    const [showError, setShowError] = useState(false);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + images.length > 4) {
            setShowError(true);
            return;
        }

        const compressImage = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const maxWidth = 800;
                        const scaleSize = maxWidth / img.width;
                        canvas.width = maxWidth;
                        canvas.height = img.height * scaleSize;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob((blob) => {
                            const compressedFile = new File([blob], file.name.split('.')[0] + '.webp', {
                                type: 'image/webp',
                            });
                            resolve(compressedFile);
                        }, 'image/webp', 0.7);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        };

        Promise.all(files.map(compressImage)).then((compressedFiles) => {
            const newPreviews = compressedFiles.map((file) => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
            setImages(prev => [...prev, ...compressedFiles]);
        });
    };

    const handleRemoveImage = (index) => {
        setPreviews(previews.filter((_, i) => i !== index));
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <>
            {showError && (
                <Alert
                    type="error"
                    message="Puedes subir hasta 4 imágenes máximo."
                    onClose={() => setShowError(false)}
                />
            )}

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
                            <FontAwesomeIcon icon={faCircleXmark} className="delete-icon" onClick={() => handleRemoveImage(index)} />
                        </div>
                    ))}

                    {images.length < 4 && (
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
                            <div className="preview-box empty"></div>
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
        </>
    );
};

export default InputImages;
