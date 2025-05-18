import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faPlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './ProviderRequest.css';
import Alert from '../../components/Alert/Alert';

const ProviderRequest = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    descripcion: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [alertType, setAlertType] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const nextStep = () => {
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const subirArchivo = async (archivo) => {
    const token = localStorage.getItem('token');
    const contentType = archivo.type || 'application/octet-stream';

    const { data } = await axios.post(
      'https://api.surtte.com/provider-requests/generate-url',
      {
        filename: archivo.name,
        mimeType: contentType,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await axios.put(data.signedUrl, archivo, {
      headers: { 'Content-Type': contentType },
    });

    return data.finalUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_empresa.trim()) {
      setAlertType('error');
      setAlertMessage('Debes ingresar el nombre de la empresa.');
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      const archivoRUTUrl = await subirArchivo(formData.archivoRUT);
      const archivoCamaraUrl = await subirArchivo(formData.archivoCamaraComercio);
      const logoUrl = await subirArchivo(logoFile);

      const token = localStorage.getItem('token');
      await axios.post(
        'https://api.surtte.com/provider-requests',
        {
          nombre_empresa: formData.nombre_empresa,
          descripcion: formData.descripcion,
          archivoRUT: archivoRUTUrl,
          archivoCamaraComercio: archivoCamaraUrl,
          logoEmpresa: logoUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlertType('success');
      setAlertMessage('¡Solicitud enviada con éxito!');
      setShowAlert(true);
      window.location.href = '/plans';
    } catch (err) {
      console.error(err);
      setAlertType('error');
      setAlertMessage('Error al enviar la solicitud');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          redirectTo={alertType === 'success' ? '/my-products' : null}
        />
      )}
      <Header minimal={true} />
      <div className="register-container request">
        <h2 id="r-title">Solicitud para ser proveedor</h2>
        <form className={`step-wrapper step-${step}`}>
          {step === 1 && (
            <div className="step slide-in">
              <div className="step-sup">
                <div>
                  <h1>Paso 1 de 2</h1>
                  <h2>Sube el logo de tu empresa</h2>
                </div>
              </div>
              <div className="image-preview-container">
                {logoPreview ? (
                  <div className="preview-box">
                    <img src={logoPreview} alt="preview-logo" />
                    <FontAwesomeIcon
                      icon={faCircleXmark}
                      className="delete-icon"
                      onClick={handleRemoveLogo}
                    />
                  </div>
                ) : (
                  <div
                    className="preview-box"
                    onClick={() =>
                      document.getElementById('hidden-file-input').click()
                    }
                  >
                    <span className="add-image">
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                    <input
                      id="hidden-file-input"
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
              <button type="button" onClick={nextStep}>
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <button className='btn-back-request' id="btn-back" type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div>
                  <h1>Paso 2 de 2</h1>
                  <h2>Información de la empresa</h2>
                </div>
              </div>

              <label>Nombre de la empresa</label>
              <input
                type="text"
                name="nombre_empresa"
                placeholder="Ej: Distribuidora Surtte"
                value={formData.nombre_empresa}
                onChange={handleChange}
                className="input-provider normal"
              />

              <label>Descripción (opcional)</label>
              <textarea
                name="descripcion"
                placeholder="Cuéntanos sobre tu empresa"
                value={formData.descripcion}
                onChange={handleChange}
                className="input-provider"
              />

              <button type="button" onClick={handleSubmit}>
                {loading ? 'Convertirse en proveedor' : 'Enviando'}
              </button>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ProviderRequest;
