import React from 'react';
import './Header.css';
import Cart from './Cart';
import Search from './Search';
import BarSup from './BarSup'; 

const Header = ({ minimal = false }) => {

    return (
        <header className={minimal ? "header minimal" : "header"}>
            <div className='buttons'>    
                <h1 id='h-title'>SUR<b>TT</b>E</h1>
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
