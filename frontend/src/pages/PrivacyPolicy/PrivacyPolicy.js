import React from 'react';
import './PrivacyPolicy.css';
import Header from '../../components/Header/Header';

const PrivacyPolicy = () => {
  return (
    <>
        <Header minimal={true} searchBar={true} backOn={true}/>
        <div className="privacy-container">
        <h1 className="privacy-title">Política de Privacidad de SURTTE</h1>

        <section className="privacy-section">
            <h2>1. Introducción</h2>
            <p>En SURTTE, respetamos tu privacidad y nos comprometemos a proteger los datos personales que compartes con nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información.</p>
        </section>

        <section className="privacy-section">
            <h2>2. Información que recopilamos</h2>
            <ul>
            <li>Datos personales: nombre, correo electrónico, teléfono, dirección, etc.</li>
            <li>Información de uso: páginas visitadas, tiempo en el sitio, etc.</li>
            <li>Datos técnicos: dirección IP, tipo de navegador, dispositivo utilizado, etc.</li>
            </ul>
        </section>

        <section className="privacy-section">
            <h2>3. Uso de la información</h2>
            <ul>
            <li>Para proveer nuestros servicios y operar la plataforma.</li>
            <li>Para mejorar la experiencia del usuario.</li>
            <li>Para enviar notificaciones y mensajes relevantes.</li>
            <li>Para fines de seguridad y prevención de fraude.</li>
            </ul>
        </section>

        <section className="privacy-section">
            <h2>4. Compartir información</h2>
            <p>No vendemos ni alquilamos tu información personal. Podemos compartirla con terceros únicamente en los siguientes casos:</p>
            <ul>
            <li>Con proveedores de servicios que nos ayudan a operar la plataforma.</li>
            <li>En cumplimiento de obligaciones legales o requerimientos de autoridades.</li>
            </ul>
        </section>

        <section className="privacy-section">
            <h2>5. Seguridad</h2>
            <p>Implementamos medidas de seguridad para proteger tu información. Sin embargo, ningún sistema es completamente seguro, por lo que no podemos garantizar protección absoluta.</p>
        </section>

        <section className="privacy-section">
            <h2>6. Derechos del usuario</h2>
            <ul>
            <li>Acceder, corregir o eliminar tus datos personales.</li>
            <li>Oponerte al procesamiento de tu información.</li>
            <li>Solicitar la portabilidad de tus datos.</li>
            </ul>
        </section>

        <section className="privacy-section">
            <h2>7. Cookies</h2>
            <p>Utilizamos cookies para mejorar tu experiencia. Puedes controlar su uso desde la configuración de tu navegador.</p>
        </section>

        <section className="privacy-section">
            <h2>8. Cambios en la política</h2>
            <p>Nos reservamos el derecho de modificar esta política. Te notificaremos cualquier cambio importante a través de la plataforma.</p>
        </section>

        <section className="privacy-section">
            <h2>9. Contacto</h2>
            <p>Si tienes preguntas sobre esta política, contáctanos en privacidad@surtte.com.</p>
        </section>
        </div>
    </>
  );
};

export default PrivacyPolicy;