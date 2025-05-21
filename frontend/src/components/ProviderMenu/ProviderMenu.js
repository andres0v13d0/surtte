import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faHeadset, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ProviderMenu.css';

const ProviderMenu = ({ providerName, isOpen, toggleMenu, currentPage }) => {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        toggleMenu(false);
      }
    };
    const handleScroll = (e) => {
      if (isOpen) e.preventDefault();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('scroll', handleScroll, { passive: false });
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, toggleMenu]);

  if (!isOpen) {
    return (
      <button className="menu-toggle-btn" onClick={() => toggleMenu(true)}>
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>
    );
  }

  const menuItems = [
    { label: 'Mis productos', path: '/my-products', key: 'products' },
    { label: 'Mis pedidos', path: '/my-orders', key: 'orders' },
    { label: 'Mis clientes', path: '/my-customers', key: 'customers' },
  ];

  return (
    <div className="provider-menu-overlay">
      <div ref={menuRef} className="provider-menu">
        <div className="menu-header">
          <div className="provider-info">
            <h3>{providerName}</h3>
            <p>Plan ultra</p>
          </div>
          <button onClick={() => toggleMenu(false)} className="close-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <ul>
          {menuItems.map(({ label, path, key }) => (
            <li key={key} >
              <Link to={path} className={currentPage === key ? 'user-button active' : 'user-button'} onClick={() => toggleMenu(false)}>
                  <span className="icon-left">
                      <FontAwesomeIcon icon={faHeadset} />
                  </span>
                  <span className="text">{label}</span>
                  <span className="icon-right">
                      <FontAwesomeIcon icon={faChevronRight} />
                  </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProviderMenu;
