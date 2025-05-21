import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import secureAxios from '../../utils/secureAxios';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Alert from '../../components/Alert/Alert';
import './NewOrder.css';

const NewOrder = () => {
  const [misProductos, setMisProductos] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [notas, setNotas] = useState('');
  const [step, setStep] = useState(1);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteBuscado, setClienteBuscado] = useState('');
  const [clienteFiltrado, setClienteFiltrado] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const providerId = usuario?.proveedorInfo?.id;
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    direccion: '',
    departamento: '',
    ciudad: ''
  });

  useEffect(() => {
    const fetchProductosDelProveedor = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await secureAxios.get(`https://api.surtte.com/products/by-provider/${providerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMisProductos(res.data);
      } catch (err) {
        console.error('Error cargando productos del proveedor:', err);
      }
    };


    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProductosDelProveedor();
      }
    });

    return () => unsubscribe();
  }, [providerId]);


  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await secureAxios.get('https://api.surtte.com/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientes(res.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };


    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchClientes();
      }
    });

    return () => unsubscribe();
  }, []);


  const [departments, setDepartments] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [productoBuscado, setProductoBuscado] = useState('');
  const [productoFiltrado, setProductoFiltrado] = useState([]);
  useEffect(() => {
    const productosGuardados = localStorage.getItem('productosTemporal');
    if (productosGuardados) {
      setProductosSeleccionados(JSON.parse(productosGuardados));
    }
  }, []);

  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const clienteGuardado = sessionStorage.getItem('clienteTemporal');
    if (!clienteSeleccionado && clienteGuardado) {
      const parsed = JSON.parse(clienteGuardado);
      setClienteSeleccionado(parsed);
      setClienteBuscado(`${parsed.celular} | ${parsed.nombre}`);
    }
  }, [clienteSeleccionado]);



  useEffect(() => {
    const state = location.state;

    if (state?.goToStep === 2) {
      setStep(2);
    }

    if (state?.clienteSeleccionado) {
      setClienteSeleccionado(state.clienteSeleccionado);
      setClienteBuscado(`${state.clienteSeleccionado.celular} | ${state.clienteSeleccionado.nombre}`);
      sessionStorage.setItem('clienteTemporal', JSON.stringify(state.clienteSeleccionado));
    }

    if (state?.productoSeleccionado) {
      const producto = state.productoSeleccionado;

      const fetchPrices = async () => {
        try {
          const res = await axios.get(`https://api.surtte.com/product-prices/product/${producto.id}`);
          const prices = res.data;

          setProductosSeleccionados(prev => {
            const exists = prev.some(p => String(p.id) === String(producto.id));
            if (!exists) {
              const nuevos = [...prev, { ...producto, productPrices: prices, cantidad: producto.cantidad || 1 }];
              localStorage.setItem('productosTemporal', JSON.stringify(nuevos));
              return nuevos;
            }
            return prev;
          });

        } catch (err) {
          console.error('Error al cargar precios del producto:', err);
        }
      };

      fetchPrices();
    }


  }, [location.state]);



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
    sessionStorage.setItem('clienteTemporal', JSON.stringify(cliente));
  };

  const guardarNuevoCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.celular || !selectedDept || !selectedCity) {
      setAlertType('error');
      setAlertMessage('Completa todos los campos del nuevo cliente.');
      setShowAlert(true);
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

      setClientes(prev => [...prev, res.data]);
      setClienteSeleccionado(res.data);
      setClienteBuscado(`${res.data.celular} | ${res.data.nombre}`);
      sessionStorage.setItem('clienteTemporal', JSON.stringify(res.data));
      setAlertType('success');
      setAlertMessage('Cliente creado correctamente.');
      setShowAlert(true);
    } catch (error) {
      setAlertType('error');
      setAlertMessage(error?.response?.data?.message || 'Error al crear cliente.');
      setShowAlert(true);
    }
  };

  const cancelarPedido = () => {
    sessionStorage.removeItem('clienteTemporal');
    localStorage.removeItem('productosTemporal'); // <--- Agregado
    setStep(1);
    setClienteSeleccionado(null);
    setClienteBuscado('');
    setProductosSeleccionados([]);
    navigate('/my-orders');
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
    const filtro = misProductos.filter(p =>
      p.name.toLowerCase().includes(texto.toLowerCase())
    );
    setProductoFiltrado(filtro);
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    setProductosSeleccionados(prev => {
      const actualizados = prev.map(p => p.id === id ? { ...p, cantidad: parseInt(nuevaCantidad) } : p);
      localStorage.setItem('productosTemporal', JSON.stringify(actualizados));
      return actualizados;
    });
  };


  const eliminarProducto = (id) => {
    setProductosSeleccionados(prev => {
      const filtrados = prev.filter(p => String(p.id) !== String(id));
      localStorage.setItem('productosTemporal', JSON.stringify(filtrados));
      return filtrados;
    });
  };


  const crearOrden = async () => {
    if (!clienteSeleccionado || productosSeleccionados.length === 0) {
      setAlertType('error');
      setAlertMessage('Debes seleccionar un cliente y al menos un producto.');
      setShowAlert(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const totalPrice = productosSeleccionados.reduce((acc, p) => acc + ((p.precio / 12) * p.cantidad), 0);

      const body = {
        providerId: providerId,
        customerId: clienteSeleccionado.id,
        items: productosSeleccionados.map(p => ({
          productId: p.id,
          productName: p.nombre,
          quantity: p.cantidad,
          unitPrice: p.precio / 12,
          unity: 'unidad',
          color: p.color || null,
          size: p.talla || null,
          imageSnapshot: p.image || null,
        })),
        notes: notas,
        totalPrice,
      };

      const res = await secureAxios.post('https://api.surtte.com/orders/manual', body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const nuevaOrden = res.data;

      setAlertType('success');
      setAlertMessage('¡Orden creada con éxito!');
      setShowAlert(true);

      setTimeout(() => {
        sessionStorage.removeItem('clienteTemporal');
        localStorage.removeItem('productosTemporal');
        setStep(1);
        setClienteSeleccionado(null);
        setClienteBuscado('');
        setProductosSeleccionados([]);
        window.location.href = `/orden/pdf/${nuevaOrden.id}`;
      }, 1500);

    } catch (err) {
      setAlertType('error');
      setAlertMessage(err?.response?.data?.message || 'Error al crear orden.');
      setShowAlert(true);
    }
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
              <button type='button' onClick={cancelarPedido} className="btn-cancel-order">Cancelar pedido</button>
            </div>
          )}

          {step === 2 && (
            <div className="step slide-in">
              <div className="step-sup">
                <button id="btn-back" type="button" onClick={() => {
                  sessionStorage.removeItem('clienteTemporal');
                  setClienteSeleccionado(null);
                  setStep(1);
                }}>
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
                      <button key={p.id} type="button" onClick={() => window.location.href = `/product/${p.id}`}>
                        {p.name}
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
                    {productosSeleccionados.map((p) => {
                      const precioAplicable = p.productPrices?.find(price =>
                        price.quantity.split(',').map(q => parseInt(q.trim())).includes(p.cantidad)
                      );

                      return (
                        <tr key={p.id}>
                          <td>{p.reference || 'N/A'}</td>
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
                                {p.productPrices?.flatMap(price =>
                                  price.quantity.split(',').map(qty => {
                                    const val = parseInt(qty.trim());
                                    return (
                                      <option key={val} value={val}>
                                        {val}
                                      </option>
                                    );
                                  })
                                )}
                              </select>
                            </div>
                          </td>
                          <td>{(Number(precioAplicable?.price) / 12).toLocaleString('es-CO', { maximumFractionDigits: 0 }) || '—'}</td>
                          <td>{(((Number(precioAplicable?.price)) / 12) * (Number(p.cantidad))).toLocaleString('es-CO', { maximumFractionDigits: 0 }) || '—'}</td>
                          <td>
                            <button type="button" className="trash-orden-icon" onClick={() => eliminarProducto(p.id)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>

              <label>Notas (opcional)</label>
              <textarea className="input-register area-order" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Escribe alguna nota..." />

              <button id="last-btn" className="btn-step1" type="button" onClick={crearOrden}>Crear orden</button>
              <button type='button' onClick={cancelarPedido} className="btn-cancel-order">Cancelar pedido</button>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default NewOrder;
