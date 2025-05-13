import React, { useEffect, useState } from 'react';
import './AdminDash.css';

const AdminDash = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [nuevoPlan, setNuevoPlan] = useState({
    name: '',
    price: '',
    features: '',
    description: '',
  });

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.surtte.com/provider-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSolicitudes(data);
    };

    fetchSolicitudes();
  }, []);

  const actualizarCampo = (id, campo, valor) => {
    const updated = solicitudes.map((s) =>
      s.id === id ? { ...s, [campo]: valor } : s
    );
    setSolicitudes(updated);
  };

  const revisarSolicitud = async (s) => {
    const token = localStorage.getItem('token');
    const estadoValido = (s.estado || '').toLowerCase();

    const body = {
      numeroRUT: s.numeroRUT,
      numeroCamaraComercio: s.numeroCamaraComercio,
      estado: estadoValido,
    };

    await fetch(`https://api.surtte.com/provider-requests/${s.id}/revisar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    alert('Solicitud revisada');
    window.location.reload();
  };

  const convertirEnProveedor = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`https://api.surtte.com/provider-requests/${id}/convertir`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Proveedor creado con éxito');
    window.location.reload();
  };

  const handleChangePlan = (campo, valor) => {
    setNuevoPlan((prev) => ({ ...prev, [campo]: valor }));
  };

  const crearPlan = async () => {
    const token = localStorage.getItem('token');

    const body = {
      name: nuevoPlan.name.trim(),
      description: nuevoPlan.description?.trim(),
      price: parseFloat(nuevoPlan.price),
      features: nuevoPlan.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch('https://api.surtte.com/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Error al crear el plan');

      alert('✅ Plan creado con éxito');
      setNuevoPlan({ name: '', price: '', features: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('❌ No se pudo crear el plan');
    }
  };

  return (
    <div className="admin-dash-container">
      {/* CREAR PLAN */}
      <div className="crear-plan">
        <h2>Crear Nuevo Plan</h2>
        <input
          type="text"
          placeholder="Nombre del plan"
          value={nuevoPlan.name}
          onChange={(e) => handleChangePlan('name', e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio (ej. 19.99)"
          value={nuevoPlan.price}
          onChange={(e) => handleChangePlan('price', e.target.value)}
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={nuevoPlan.description}
          onChange={(e) => handleChangePlan('description', e.target.value)}
        />
        <textarea
          placeholder="Características (una por línea)"
          value={nuevoPlan.features}
          onChange={(e) => handleChangePlan('features', e.target.value)}
          rows={5}
        />
        <button className="btn-crear-plan" onClick={crearPlan}>
          Crear Plan
        </button>
      </div>

      {/* SOLICITUDES */}
      <h2>Solicitudes de Proveedor</h2>
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes registradas.</p>
      ) : (
        solicitudes.map((s) => (
          <div key={s.id} className="solicitud-card">
            <p><strong>Usuario:</strong> {s.usuario?.nombre}</p>
            <p><strong>Empresa:</strong> {s.nombre_empresa}</p>

            {(s.archivoRUT || s.archivoCamaraComercio) && (
              <div className="docs-preview">
                <p><strong>Documentos subidos:</strong></p>
                {s.archivoRUT && (
                  <a href={s.archivoRUT} target="_blank" rel="noopener noreferrer">
                    Ver RUT
                  </a>
                )}
                <br />
                {s.archivoCamaraComercio && (
                  <a href={s.archivoCamaraComercio} target="_blank" rel="noopener noreferrer">
                    Ver Cámara de Comercio
                  </a>
                )}
              </div>
            )}

            <label>Número RUT</label>
            <input
              type="text"
              value={s.numeroRUT || ''}
              onChange={(e) => actualizarCampo(s.id, 'numeroRUT', e.target.value)}
            />

            <label>Número Cámara de Comercio</label>
            <input
              type="text"
              value={s.numeroCamaraComercio || ''}
              onChange={(e) => actualizarCampo(s.id, 'numeroCamaraComercio', e.target.value)}
            />

            <label>Estado</label>
            <select
              value={s.estado}
              onChange={(e) => actualizarCampo(s.id, 'estado', e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <p><strong>Pago:</strong> {s.pagoRealizado ? '✅' : '❌'}</p>

            <button className="btn-revisar" onClick={() => revisarSolicitud(s)}>
              Guardar revisión
            </button>

            {s.estado === 'aprobado' && s.pagoRealizado && (
              <button className="btn-convertir" onClick={() => convertirEnProveedor(s.id)}>
                Convertir en proveedor
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDash;
