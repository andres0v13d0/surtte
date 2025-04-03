import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AddProduct = () => {
    const [images, setImages] = useState([]);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [prices, setPrices] = useState([]);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + images.length > 5) {
            alert('You can upload up to 5 images only.');
            return;
        }
        setImages([...images, ...files]);
    };

    const handleAddPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (!isNaN(numericPrice)) {
            const updatedPrices = [...prices, numericPrice].sort((a, b) => b - a);
            setPrices(updatedPrices);
        }
    };

    return (
        <>
            <Header minimal={true}/>
            <div>
                <h1>Add Product</h1>

                <div>
                    <h2>Upload Images</h2>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                    />
                    <p>{images.length}/5 images uploaded</p>
                    <div>
                        {images.map((image, index) => (
                            <p key={index}>{image.name}</p>
                        ))}
                    </div>
                </div>

                <div>
                    <h2>Product Information</h2>
                    <div>
                        <label>Product Name (max 20 words):</label>
                        <input
                            type="text"
                            value={productName}
                            maxLength={100}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                        <p>{productName.split(' ').length}/20 words</p>
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <h2>Prices</h2>
                    <input
                        type="number"
                        placeholder="Add a price"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddPrice(e.target.value);
                                e.target.value = '';
                            }
                        }}
                    />
                    <ul>
                        {prices.map((price, index) => (
                            <li key={index}>${price.toFixed(2)}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AddProduct;