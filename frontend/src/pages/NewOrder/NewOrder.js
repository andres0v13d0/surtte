import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Alert from '../../components/Alert/Alert';
import './NewOrder.css';

const mockClientes = [
  { id: 1, nombre: 'Carlos Pérez', celular: '3101234567', departamento: 'Antioquia', ciudad: 'Medellín' },
  { id: 2, nombre: 'María Gómez', celular: '3109876543', departamento: 'Cundinamarca', ciudad: 'Bogotá' },
];

const mockProductos = [
  { id: 'SKU1234', nombre: 'Tennis', talla: 'M', color: 'Negro', precio: 400000 },
  { id: 'SKU5678', nombre: 'Camiseta', talla: 'L', color: 'Rojo', precio: 200000 },
];

const NewOrder = () => {
  const [step, setStep] = useState(1);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [clientes, setClientes] = useState(mockClientes);
  const [clienteBuscado, setClienteBuscado] = useState('');
  const [clienteFiltrado, setClienteFiltrado] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
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

  const [productoBuscado, setProductoBuscado] = useState('');
  const [productoFiltrado, setProductoFiltrado] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Error cargando departamentos:', err));
  }, []);

  const filtrarClientes = (texto) => {
    setClienteBuscado(texto);
    if (!texto.trim()) {
      setClienteFiltrado([]);
      return;
    }
    const filtro = clientes.filter(c =>
      `${c.celular} | ${c.nombre}`.toLowerCase().includes(texto.toLowerCase())
    );
    setClienteFiltrado(filtro);
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClienteBuscado(`${cliente.celular} | ${cliente.nombre}`);
    setClienteFiltrado([]);
  };

  const guardarNuevoCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.celular || !selectedDept || !selectedCity) {
      setAlertType('error');
      setAlertMessage('Completa todos los campos del nuevo cliente.');
      setShowAlert(true);
      return;
    }

    const nuevo = {
      id: clientes.length + 1,
      nombre: `${nuevoCliente.nombre} ${nuevoCliente.apellido}`,
      celular: nuevoCliente.celular,
      direccion: nuevoCliente.direccion,
      departamento: selectedDept,
      ciudad: selectedCity
    };

    setClientes([...clientes, nuevo]);
    setClienteSeleccionado(nuevo);
    setClienteBuscado(`${nuevo.celular} | ${nuevo.nombre}`);
    setNuevoCliente({
      nombre: '',
      apellido: '',
      celular: '',
      direccion: '',
      departamento: '',
      ciudad: ''
    });
    setSelectedCity(null);
    setSelectedDept(null);
    setAlertType('success');
    setAlertMessage('Cliente creado correctamente.');
    setShowAlert(true);
  };

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


  const filtrarProductos = (texto) => {
    setProductoBuscado(texto);
    if (!texto.trim()) {
      setProductoFiltrado([]);
      return;
    }
    const filtro = mockProductos.filter(p =>
      p.nombre.toLowerCase().includes(texto.toLowerCase())
    );
    setProductoFiltrado(filtro);
  };

  const agregarProducto = (prod) => {
    if (productosSeleccionados.find(p => p.id === prod.id)) return;
    setProductosSeleccionados([
      ...productosSeleccionados,
      { ...prod, cantidad: 1 }
    ]);
    setProductoBuscado('');
    setProductoFiltrado([]);
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    setProductosSeleccionados(prev =>
      prev.map(p => p.id === id ? { ...p, cantidad: parseInt(nuevaCantidad) } : p)
    );
  };

  const eliminarProducto = (id) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
  };

  const crearOrden = () => {
    if (!clienteSeleccionado || productosSeleccionados.length === 0) {
      setAlertType('error');
      setAlertMessage('Debes seleccionar un cliente y al menos un producto.');
      setShowAlert(true);
      return;
    }

    setAlertType('success');
    setAlertMessage('¡Orden creada con éxito!');
    setShowAlert(true);
    setClienteSeleccionado(null);
    setClienteBuscado('');
    setProductosSeleccionados([]);
  };

  return (
    <>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <Header minimal={true} />
      <div className="register-container add-order">
        <h2 id="r-title">Crear un nuevo pedido</h2>

        <form className={`step-wrapper step-${step}`}>
          {step === 1 && (
            <div className="step slide-in">
              <div className="step-sup">
                <div>
                  <h1>Paso 1 de 2</h1>
                  <h2>Selecciona un cliente</h2>
                </div>
              </div>

              <button type="button" className='new-client' onClick={() => setMostrarNuevoCliente(!mostrarNuevoCliente)}>Nuevo cliente</button>

              <label className="label-register">Buscar cliente (celular o nombre)</label>
              <input
                type="text"
                value={clienteBuscado}
                onChange={(e) => filtrarClientes(e.target.value)}
                placeholder="Ej.: 3101234567 | Carlos"
                className="input-register"
              />
              {clienteFiltrado.length > 0 && (
                <div className="list-search">
                  <div className="list-finded">
                    {clienteFiltrado.map(c => (
                      <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}>
                        {c.celular} | {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mostrarNuevoCliente && (

                <div className="new-customer-container">
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

                        <button type="button" onClick={() => {
                            guardarNuevoCliente();
                            cerrarModalNuevoCliente();
                        }}>Guardar cliente</button>
                    </div>
                    </div>
                </div>
                )}

              <button type="button" className="btn-step1" onClick={() => setStep(2)}>Siguiente</button>
            </div>
          )}

          {step === 2 && (
            <div className="step slide-in">
              <div className="step-sup">
                <button id="btn-back" type="button" onClick={() => setStep(1)}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div>
                  <h1>Paso 2 de 2</h1>
                  <h2>Selecciona los productos</h2>
                </div>
              </div>

              <label>Buscar producto</label>
              <input
                type="text"
                value={productoBuscado}
                onChange={(e) => filtrarProductos(e.target.value)}
                placeholder="Ej.: Tennis"
                className="input-register"
              />
              {productoFiltrado.length > 0 && (
                <div className="list-search">
                  <div className="list-finded">
                    {productoFiltrado.map(p => (
                      <button key={p.id} type="button" onClick={() => agregarProducto(p)}>
                        {p.nombre} | {p.talla} | {p.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
                <div className="list-products-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Ref.</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Valor Unitario</th>
                        <th>Valor total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosSeleccionados.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>
                            <div className="product-name-table">
                              <p>{p.nombre}</p>
                              <p>Talla: {p.talla}</p>
                              <p>Color: {p.color}</p>
                            </div>
                          </td>
                          <td>
                            <div className='product-quantity-table'>
                                <select
                                    value={p.cantidad}
                                    onChange={(e) => cambiarCantidad(p.id, e.target.value)}
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                          </td>
                          <td>{p.precio.toLocaleString()}</td>
                          <td>{(p.precio * p.cantidad).toLocaleString()}</td>
                          <td>
                            <FontAwesomeIcon icon={faTrash} onClick={() => eliminarProducto(p.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              <label>Notas (opcional)</label>
              <textarea className="input-register area-order" placeholder="Escribe alguna nota..." />

              <button id="last-btn" type="button" onClick={crearOrden}>Crear orden</button>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default NewOrder;
