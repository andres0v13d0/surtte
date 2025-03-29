import React, { useState } from 'react';
import './Header.css';
import Cart from './Cart';
import Search from './Search';
import BarSup from './BarSup'; 
import Menu from './Menu'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Header = ({ minimal = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className={minimal ? "header minimal" : "header"}>
            <div className='buttons'>
                {!minimal && (
                    <button onClick={() => setIsMenuOpen(true)}>
                        <FontAwesomeIcon id='icons' icon={faBars} />
                    </button>
                )}
                <h1 id='h-title'>SUR<b>TT</b>E</h1>
                {!minimal && <Cart />}
            </div>

            {!minimal && (
                <>
                    <Search />
                    <BarSup />
                    <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                </>
            )}
        </header>
    );
};

export default Header;
