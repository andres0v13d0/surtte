import React from 'react';
import './Search.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Search = () => {
    return (
        <div className='search'>
            <input type="text" placeholder="Buscar..." id="search-input" />
            <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
    );
}

export default Search;