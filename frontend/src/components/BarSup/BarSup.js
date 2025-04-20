import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BarSup.css';

const BarSup = () => {
  const [subcategorias, setSubcategorias] = useState([]);

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

  return (
    <div className='bar-sup'>
      <Link to="/" id="link-sup">Todos</Link>
      {subcategorias.map((sub) => (
        <Link key={sub.id} to={`/sub-category/${sub.slug}`} id="link-sup">
          {sub.name}
        </Link>
      ))}
    </div>
  );
};

export default BarSup;
