import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = ({navinf=false}) => {
    return (
        <footer className={navinf ? 'footer margin' : 'footer'}>
            <p>© {new Date().getFullYear()} Todos los derechos reservados: Surtte<b>®</b></p>
            <div className='links-foot'>
                <Link to='/condiciones'>Condiciones de uso</Link>
                <Link to='/politica'>Política de privacidad</Link>
            </div>
        </footer>
    );
}

export default Footer;