import React from 'react';
import Header from '../components/Header';
import NavInf from '../components/NavInf';
import Footer from '../components/Footer';
import './Categories.css';

const categories = [
    "Vestidos de mujer",
    "Camisetas de mujer",
    "Joyas para mujer",
    "Blusas y camisas para mujer",
    "Fundas y estuches",
    "Decoración del hogar",
    "Conjuntos para mujer",
    "Pijamas para mujer",
    "Ropa deportiva de hombre",
    "Ropa deportiva para mujer",
    "Auriculares y accesorios",
    "Ropa de cama",
    "Panties para mujer",
    "Motocicletas",
    "Calzado deportivo para mujer"
];

const Categories = () => {
    return (
        <>
            <Header />
            <div className="categories-container">
                <aside className="sidebar">
                    <h3>Destacado</h3>
                    <ul>
                        <li>Hogar y cocina</li>
                        <li>Ropa de mujer</li>
                        <li>Mujer curvy</li>
                        <li>Calzado de mujer</li>
                        <li>Lencería y pijamas</li>
                        <li>Ropa de hombre</li>
                        <li>Calzado de hombre</li>
                        <li>Deporte y aire libre</li>
                        <li>Joyería y accesorios</li>
                    </ul>
                </aside>
                <section className="categories-main">
                    <div className="category-grid">
                        {categories.map((label, i) => (
                            <div className="category-item" key={i}>
                                <div className="circle-image">
                                    <img src="/camiseta.avif" alt={label} />
                                </div>
                                <span>{label}</span>
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
