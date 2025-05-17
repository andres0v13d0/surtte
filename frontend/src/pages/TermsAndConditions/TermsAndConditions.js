import React from 'react';
import './TermsAndConditions.css';
import Header from '../../components/Header/Header';

const TermsAndConditions = () => {
  return (
    <>
      <Header minimal={true} searchBar={true} backOn={true}/>
      <div className="terms-container">
        <h1 className="terms-title">Términos y Condiciones de SURTTE</h1>

        <section className="terms-section">
          <h2>1. Aceptación de los términos</h2>
          <p>Al acceder o utilizar nuestros servicios, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte, por favor no utilices SURTTE.</p>
        </section>

        <section className="terms-section">
          <h2>2. Definiciones</h2>
          <p><strong>Proveedor:</strong> Usuario que ofrece productos dentro de la plataforma.<br />
          <strong>Comerciante:</strong> Usuario que compra productos de los proveedores.<br />
          <strong>SURTTE:</strong> Plataforma intermediaria que facilita la conexión entre comerciantes y proveedores.</p>
        </section>

        <section className="terms-section">
          <h2>3. Registro de usuarios</h2>
          <p>Los usuarios deben proporcionar información verdadera y actualizada. Nos reservamos el derecho de suspender o cancelar cuentas que incumplan esta norma.</p>
        </section>

        <section className="terms-section">
          <h2>4. Obligaciones del usuario</h2>
          <ul>
            <li>Utilizar la plataforma de forma legal y respetuosa.</li>
            <li>No suplantar a otras personas ni publicar contenido falso.</li>
            <li>Respetar los derechos de propiedad intelectual de otros.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Responsabilidad del proveedor</h2>
          <p>El proveedor es responsable de la veracidad de sus productos, tiempos de entrega, condiciones de venta y atención al cliente.</p>
        </section>

        <section className="terms-section">
          <h2>6. Pagos y comisiones</h2>
          <p>Los proveedores aceptan el uso de plataformas de pago autorizadas. SURTTE puede cobrar comisiones por servicios, las cuales serán informadas previamente.</p>
        </section>

        <section className="terms-section">
          <h2>7. Cancelaciones y devoluciones</h2>
          <p>Cada proveedor define su política de cancelaciones. El comerciante debe revisarla antes de realizar un pedido. SURTTE puede intervenir en disputas bajo ciertas condiciones.</p>
        </section>

        <section className="terms-section">
          <h2>8. Propiedad intelectual</h2>
          <p>Todo el contenido original de SURTTE (logo, código, imágenes, textos) es propiedad de la plataforma. Está prohibido su uso no autorizado.</p>
        </section>

        <section className="terms-section">
          <h2>9. Modificaciones</h2>
          <p>SURTTE puede modificar estos términos en cualquier momento. Los usuarios serán notificados mediante la plataforma.</p>
        </section>

        <section className="terms-section">
          <h2>10. Contacto</h2>
          <p>Para dudas o consultas, escríbenos a soporte@surtte.com.</p>
        </section>
      </div>
    </>
  );
};

export default TermsAndConditions;

