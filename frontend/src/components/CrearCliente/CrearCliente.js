import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import secureAxios from '../../utils/secureAxios';
import axios from 'axios';
import './CrearCliente.css'
import Alert from '../Alert/Alert';

const CrearCliente = ({ onClienteCreado }) => {
    const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: '',
        apellido: '',
        celular: '',
        direccion: '',
        departamento: '',
        ciudad: ''
    });

    const [departments, setDepartments] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        axios.get('https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json')
            .then(res => setDepartments(res.data))
            .catch(err => console.error('Error cargando departamentos:', err));
    }, []);

    const handleDeptChange = (selected) => {
        setSelectedDept(selected?.value || null);
        setSelectedCity(null);
        const depto = departments.find(d => d.departamento === selected?.value);
        setCiudades(depto ? depto.ciudades.map(c => ({ value: c, label: c })) : []);
    };

    const cerrarModalNuevoCliente = () => {
        setNuevoCliente({
            nombre: '',
            apellido: '',
            celular: '',
            direccion: '',
            departamento: '',
            ciudad: ''
        });
        setSelectedDept(null);
        setSelectedCity(null);
        setMostrarNuevoCliente(false);
    };

    const guardarNuevoCliente = async () => {
        if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.celular || !selectedDept || !selectedCity) {
            setAlert({ show: true, type: 'error', message: 'Completa todos los campos del nuevo cliente.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await secureAxios.post('https://api.surtte.com/customers/manual', {
                nombre: `${nuevoCliente.nombre} ${nuevoCliente.apellido}`,
                celular: nuevoCliente.celular,
                direccion: nuevoCliente.direccion,
                departamento: selectedDept,
                ciudad: selectedCity,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAlert({ show: true, type: 'success', message: 'Cliente creado correctamente.' });
            if (onClienteCreado) onClienteCreado(res.data);
            cerrarModalNuevoCliente();
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: error?.response?.data?.message || 'Error al crear cliente.'
            });
        }
    };

    return (
        <>
            <button type="button" className='new-client' onClick={() => setMostrarNuevoCliente(!mostrarNuevoCliente)}>
                Nuevo cliente
            </button>

            {alert.show && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(false)}
                />
            )}

            {mostrarNuevoCliente && (
                <div className="new-customer-container componente">
                    <h1>Ingresar nuevo cliente</h1>
                    <div className="customer-data">
                        <div className="data-names">
                            <div>
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Carlos"
                                    value={nuevoCliente.nombre}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Apellido</label>
                                <input
                                    type="text"
                                    placeholder="Pérez"
                                    value={nuevoCliente.apellido}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })}
                                />
                            </div>
                        </div>

                        <label>Celular</label>
                        <input
                            type="text"
                            placeholder="3101234567"
                            value={nuevoCliente.celular}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, celular: e.target.value })}
                        />

                        <label>Dirección</label>
                        <input
                            type="text"
                            placeholder="Cra 10 #20-30"
                            value={nuevoCliente.direccion}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                        />

                        <label>Departamento</label>
                        <Select
                            options={departments.map(d => ({ value: d.departamento, label: d.departamento }))}
                            value={selectedDept ? { value: selectedDept, label: selectedDept } : null}
                            onChange={handleDeptChange}
                            placeholder="Selecciona un departamento"
                        />

                        <label>Ciudad</label>
                        <Select
                            options={ciudades}
                            value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                            onChange={(selected) => setSelectedCity(selected?.value || null)}
                            placeholder="Selecciona una ciudad"
                        />

                        <div className="buttons-customer">
                            <button type='button' onClick={cerrarModalNuevoCliente}>Cancelar</button>
                            <button type="button" onClick={guardarNuevoCliente}>Guardar cliente</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CrearCliente;
