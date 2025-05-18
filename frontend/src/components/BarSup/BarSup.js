import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BarSup.css';

const BarSup = () => {
  const [subcategorias, setSubcategorias] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const res = await fetch('https://api.surtte.com/sub-categories');
        const data = await res.json();
        setSubcategorias(data);
      } catch (err) {
        console.error('Error al cargar subcategorías:', err);
      }
    };

    fetchSubcategorias();
  }, []);

  const currentSlug = location.pathname.split('/sub-category/')[1];

  return (
    <div className='bar-sup'>
      <Link
        to="/"
        id="link-sup"
        className={location.pathname === '/' ? 'selected' : ''}
      >
        Todos
      </Link>

      {subcategorias.map((sub) => (
        <Link
          key={sub.id}
          to={`/sub-category/${sub.slug}`}
          id="link-sup"
          className={currentSlug === sub.slug ? 'selected' : ''}
        >
          {sub.name}
        </Link>
      ))}
    </div>
  );
};

export default BarSup;
