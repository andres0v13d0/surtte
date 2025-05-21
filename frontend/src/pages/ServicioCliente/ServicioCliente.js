import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
    faHandshake,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import './ServicioCliente.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

export default function ServicioCliente() {
    const navigate = useNavigate();

    const handleProveedorClick = () => {
        navigate('/solicitud');
    };

    return (
        <>
            <Header minimal={true} />
            <div className="servicio-container">
                <header className="servicio-header">
                    <h1>Servicio al Cliente</h1>
                    <p>Estamos aquí para ayudarte en todo lo que necesites. ¡Tu satisfacción es nuestra prioridad!</p>
                </header>

                <section className="info-section">
                    <div className="info-item">
                        <FontAwesomeIcon icon={faPhone} className="info-icon" />
                        <h3>Llámanos</h3>
                        <p>+57 315 789 4560</p>
                    </div>
                    <div className="info-item">
                        <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                        <h3>Correo electrónico</h3>
                        <p>soporte@surtte.com</p>
                    </div>
                    <div className="info-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                        <h3>Oficinas</h3>
                        <p>Calle 10 # 34-56, Cali, Colombia</p>
                    </div>
                    <div className="info-item">
                        <FontAwesomeIcon icon={faClock} className="info-icon" />
                        <h3>Horario de atención</h3>
                        <p>Lunes a Viernes de 8:00 AM a 6:00 PM</p>
                    </div>
                </section>

                <section className="proveedor-section">
                    <FontAwesomeIcon icon={faHandshake} className="proveedor-icon" />
                    <h2>¿Quieres ser proveedor?</h2>
                    <p>Únete a nuestra comunidad de proveedores y haz crecer tu negocio con nosotros. Tendrás acceso a miles de compradores, herramientas para gestionar tus productos y un equipo de soporte dedicado.</p>
                    <button onClick={handleProveedorClick} className="proveedor-button">
                        Más información
                    </button>
                </section>
            </div>
            <Footer />  
        </>
    );
}
