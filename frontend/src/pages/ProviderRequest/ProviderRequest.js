import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ProviderRequest = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    descripcion: '',
    archivoRUT: null,
    archivoCamaraComercio: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const nextStep = () => {
    if (!formData.nombre_empresa.trim()) {
      alert('Debes ingresar el nombre de la empresa.');
      return;
    }
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const subirArchivo = async (archivo) => {
  const token = localStorage.getItem('token');
  const contentType = archivo.type || 'application/octet-stream'; // fallback por si el navegador no detecta MIME

  console.log('Archivo:', archivo.name, 'Tipo:', contentType); // debug

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
    if (!formData.archivoRUT || !formData.archivoCamaraComercio) {
      alert('Debes subir ambos archivos.');
      return;
    }

    try {
      setLoading(true);
      const archivoRUTUrl = await subirArchivo(formData.archivoRUT);
        const archivoCamaraUrl = await subirArchivo(formData.archivoCamaraComercio);

        if (!archivoRUTUrl || !archivoCamaraUrl) {
        alert('Error al subir los archivos, intenta de nuevo.');
        setLoading(false);
        return;
        }

      const token = localStorage.getItem('token');
      await axios.post(
        'https://api.surtte.com/provider-requests',
        {
          nombre_empresa: formData.nombre_empresa,
          descripcion: formData.descripcion,
          archivoRUT: archivoRUTUrl,
          archivoCamaraComercio: archivoCamaraUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('¡Solicitud enviada con éxito!');
      window.location.href = '/plans';
    } catch (err) {
      console.error(err);
      alert('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 id="r-title">Solicitud para ser proveedor</h2>
      <form className={`step-wrapper step-${step}`}>
        {step === 1 && (
          <div className="step slide-in">
            <div className="step-sup">
              <div>
                <h1>Paso 1 de 2</h1>
                <h2>Datos de la empresa</h2>
              </div>
            </div>

            <label>Nombre de la empresa</label>
            <input
              type="text"
              name="nombre_empresa"
              placeholder="Ej: Distribuidora Surtte"
              value={formData.nombre_empresa}
              onChange={handleChange}
            />

            <label>Descripción (opcional)</label>
            <textarea
              name="descripcion"
              placeholder="Cuéntanos sobre tu empresa"
              value={formData.descripcion}
              onChange={handleChange}
            />

            <button type="button" onClick={nextStep}>Siguiente</button>
          </div>
        )}

        {step === 2 && (
          <div className="step slide-in">
            <div className="step-sup">
              <button id="btn-back" type="button" onClick={prevStep}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <div>
                <h1>Paso 2 de 2</h1>
                <h2>Documentación requerida</h2>
              </div>
            </div>

            <label>Cargar RUT</label>
            <input
              type="file"
              name="archivoRUT"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
            />

            <label>Cámara de comercio</label>
            <input
              type="file"
              name="archivoCamaraComercio"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
            />

            <button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProviderRequest;
