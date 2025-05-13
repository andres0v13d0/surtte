import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <h1 id='h-footer'>Todos los reservados - 2025</h1>
            <Link to="/solicitud" className="contacto">Quiero ser proveedor</Link>
        </footer>
    );
}

export default Footer;