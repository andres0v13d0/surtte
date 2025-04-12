import React, { useState } from 'react';
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

const sidebarItems = [
    "Destacado",
    "Hogar",
    "Ropa de mujer",
    "Mujer curvy",
    "Calzado de mujer",
    "Lencería y pijamas",
    "Ropa de hombre",
    "Calzado de hombre",
    "Deporte y aire libre",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios",
    "Joyería y accesorios"
];

const Categories = () => {
    const [selected, setSelected] = useState("Destacado");

    return (
        <>
            <Header />
            <div className="categories-container">
                <aside className="sidebar">
                    <ul>
                        {sidebarItems.map((item, i) => (
                            <li
                                key={i}
                                id={selected === item ? 'selected-cat' : undefined}
                                onClick={() => setSelected(item)}
                            >
                                {item}
                            </li>
                        ))}
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
