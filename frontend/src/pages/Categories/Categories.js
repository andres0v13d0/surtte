import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Footer from '../../components/Footer/Footer';
import './Categories.css';

const Categories = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subsRes, imagesRes] = await Promise.all([
                    fetch('https://api.surtte.com/sub-categories'),
                    fetch('https://api.surtte.com/sub-categories/with-image'),
                ]);

                const subData = await subsRes.json();

                // Revisar qué devuelve realmente la otra API
                const raw = await imagesRes.text();
                console.log('Respuesta de with-image:', raw);

                const imagesData = JSON.parse(raw); // Solo si sabemos que es JSON válido
                console.log('Parsed imageData:', imagesData);

                // Unimos las imágenes con las subcategorías
                const mergedSubCategories = subData.map(sub => {
                    const imageMatch = imagesData.find(img => img.id === sub.id);
                    return {
                        ...sub,
                        imageUrl: imageMatch?.imageUrl || '/camiseta.avif',
                    };
                });

                setSubCategories(mergedSubCategories);

                // Extraemos categorías únicas
                const uniqueCategories = [];
                mergedSubCategories.forEach(sub => {
                    if (!uniqueCategories.find(cat => cat.id === sub.category.id)) {
                        uniqueCategories.push(sub.category);
                    }
                });

                setCategories(uniqueCategories);
                if (uniqueCategories.length > 0) {
                    setSelectedCategoryId(uniqueCategories[0].id);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Header />
            <div className="categories-container">
                <aside className="sidebar">
                    <ul>
                        {categories.map((cat) => (
                            <li
                                key={cat.id}
                                id={selectedCategoryId === cat.id ? 'selected-cat' : undefined}
                                onClick={() => setSelectedCategoryId(cat.id)}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                </aside>
                <section className="categories-main">
                    <div className="category-grid">
                        {subCategories
                            .filter((sub) => sub.category.id === selectedCategoryId)
                            .map((sub) => (
                                <div className="category-item" key={sub.id}>
                                    <div className="circle-image">
                                        <img src={sub.imageUrl} alt={sub.name} />
                                    </div>
                                    <span>{sub.name}</span>
                                </div>
                            ))}
                    </div>
                </section>
            </div>
            <NavInf selected="categories" />
            <Footer />
        </>
    );
};

export default Categories;
