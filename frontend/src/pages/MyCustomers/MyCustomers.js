import Header from "../../components/Header/Header";
import NavInf from "../../components/NavInf/NavInf";
import Footer from "../../components/Footer/Footer";
import Alert from "../../components/Alert/Alert";
import CrearCliente from "../../components/CrearCliente/CrearCliente";
import './MyCustomers.css'
import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import secureAxios from '../../utils/secureAxios';

const MyCustomers = () => {
    const [clientes, setClientes] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');


    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await secureAxios.get('/customers');
                setClientes(res.data);
            } catch (err) {
                console.error('Error al cargar clientes:', err);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchClientes();
            }
        });

        return () => unsubscribe();
    }, []);


    const toggleExclusividad = async (clienteId, esExclusivo) => {
        try {
            const endpoint = esExclusivo
                ? `/customers/${clienteId}/remove-exclusive`
                : `/customers/${clienteId}/exclusive`;

            await secureAxios.patch(endpoint);

            setClientes(prev =>
                prev.map(c =>
                    c.id === clienteId ? { ...c, isExclusive: !esExclusivo } : c
                )
            );

            setAlertType('info');
            setAlertMessage('Exclusividad actualizada');
            setShowAlert(true);
        } catch (err) {
            setAlertType('error');
            setAlertMessage('Hubo un error al actualizar');
            setShowAlert(true);
            console.error('Error al cambiar exclusividad:', err);
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

            <Header
                minimal={true}
                providerName={JSON.parse(localStorage.getItem('usuario'))?.proveedorInfo?.nombre_empresa}
                menuProvider={true}
                currentPage='customers'
            />
            <div className="customers-container">
                <h1>Lista de clientes</h1>
                <CrearCliente onClienteCreado={(nuevoCliente) => {
                    console.log('Nuevo cliente:', nuevoCliente);
                }} />

                <div className="list-products-container costumer">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Celular</th>
                                <th>Direccion</th>
                                <th>Ciudad</th>
                                <th>Departamento</th>
                                <th>Exclusividad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id} className={cliente.isExclusive ? "exclusive" : ""}>
                                    <td>{cliente.nombre}</td>
                                    <td>+57 {cliente.celular}</td>
                                    <td>{cliente.direccion}</td>
                                    <td>{cliente.ciudad}</td>
                                    <td>{cliente.departamento}</td>
                                    <td>
                                        <div className="check-exclusive">
                                            <input
                                                type="checkbox"
                                                checked={cliente.isExclusive || false}
                                                onChange={() => toggleExclusividad(cliente.id, cliente.isExclusive)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
            <NavInf />
            <Footer />
        </>
    );
}

export default MyCustomers;