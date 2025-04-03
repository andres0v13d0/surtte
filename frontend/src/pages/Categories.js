import React from 'react';
import Header from '../components/Header';
import NavInf from '../components/NavInf';
import Footer from '../components/Footer';

const Categories = () => {
    return (
        <>
            <Header />
            <div className="categories-container" style={{ display: 'flex' }}>
                <nav style={{ width: '20%', backgroundColor: '#f4f4f4', padding: '1rem' }}>
                    <ul>
                        <li><a href="#category1">Category 1</a></li>
                        <li><a href="#category2">Category 2</a></li>
                        <li><a href="#category3">Category 3</a></li>
                    </ul>
                </nav>
                <section style={{ flex: 1, padding: '1rem' }}>
                    <h1>Categories Section</h1>
                    <p>Here you can display the content of the selected category.</p>
                </section>
            </div>
            <NavInf selected="categories" />
            <Footer />
        </>
    );
};

export default Categories;