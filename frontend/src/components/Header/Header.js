import React, { useState } from 'react';
import './Header.css';
import Cart from '../Cart/Cart';
import Search from '../Search/Search';
import BarSup from '../BarSup/BarSup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ProviderMenu from '../ProviderMenu/ProviderMenu';

const Header = ({ minimal = false, searchBar = false, menuProvider = false, providerName = '', currentPage = '' }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    if (searchBar) {
        return (
            <header className="header search-bar">
                <div className='back-button-header' onClick={() => window.history.back()}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </div>
                <Search />
            </header>
        );
    }

    return (
        <header className={minimal ? "header minimal" : "header"} style={{ position: 'relative' }}>
            <div className='buttons'>
                {menuProvider && (
                    <ProviderMenu
                        providerName={providerName}
                        isOpen={menuOpen}
                        toggleMenu={setMenuOpen}
                        currentPage={currentPage}
                    />
                )}
                <h1 onClick={() => window.location.href = "/"} id='h-title'>SUR<b>TT</b>E</h1>
                {!minimal && <Cart />}
            </div>

            {!minimal && (
                <>
                    <Search />
                    <BarSup />
                </>
            )}
        </header>
    );
};

export default Header;
