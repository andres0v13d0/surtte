import React, { useState } from 'react';
import './Header.css';
import Search from '../Search/Search';
import BarSup from '../BarSup/BarSup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ProviderMenu from '../ProviderMenu/ProviderMenu';

const Header = ({ minimal = false, searchBar = false, menuProvider = false, providerName = '', currentPage = '', backOn = false }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    if (searchBar) {
        return (
            <header className="header search-bar">
                <div className={backOn ? "back-button-header only" : "back-button-header"} onClick={() => window.history.back()}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    {backOn && (
                        <h1 id='h-title'>Sur<b>tt</b>e</h1>
                    )}
                </div>
                {!backOn && (
                    <Search />
                )}
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
                {(minimal || menuProvider) && (
                    <h1 onClick={() => window.location.href = "/"} id='h-title'>Sur<b>tt</b>e</h1>
                )}
            </div>

            {!minimal && (
                <>
                    <div className='title-header'>
                        <h1 onClick={() => window.location.href = "/"} id='h-title'>Sur<b>tt</b>e</h1>
                        <Search />
                    </div>
                    <BarSup />
                </>
            )}
        </header>
    );
};

export default Header;
