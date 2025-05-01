import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const InputPrices = ({
  priceBlocks,
  updatePriceBlock,
  handleAddPriceBlock,
  handleRemovePriceBlock,
  goToStep,
  camposInvalidos,
  setCamposInvalidos
}) => {
  return (
    <div className="step slide-in">
      <div className='step-sup'>
        <button id="btn-back" type="button" onClick={() => goToStep(1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div>
          <h1>Paso 3 de 3</h1>
          <h2>Precios del producto</h2>
        </div>
      </div>

      {priceBlocks.map((block, index) => (
        <div key={block.id}>
          <fieldset className="price-fieldset">
            <label>Cantidad</label>
            <input
              type="text"
              className={`inputQuantity ${camposInvalidos?.precios?.[index]?.cantidad ? 'input-error' : ''}`}
              placeholder="Ej: 1 - 5  |  6  |  12 en adelante"
              value={block.cantidad}
              onKeyDown={(e) => {
                const allowedKeys = [
                  'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', ' '
                ];
                const allowedLetters = ['e', 'n', 'a', 'd', 'l', 'i', 't', 'o'];
                const allowedChars = /[0-9\- ]/;

                if (
                  !allowedKeys.includes(e.key) &&
                  !allowedLetters.includes(e.key.toLowerCase()) &&
                  !allowedChars.test(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let value = e.target.value.toLowerCase()
                  .replace(/[,./*+=¿¡?<>()[\]{}"']+/g, '') 
                  .replace(/\s{2,}/g, ' ')               
                  .replace(/(\d+)\s*en\s*adelante/g, '$1 en adelante') 

                const soloNumeros = /^\d+$/;
                const rango = /^\d+\s*-\s*\d+$/;
                const enAdelante = /^\d+\s+en\s+adelante$/;

                const esValido = soloNumeros.test(value) || rango.test(value) || enAdelante.test(value);

                updatePriceBlock(block.id, 'cantidad', value);

                setCamposInvalidos((prev) => ({
                  ...prev,
                  precios: {
                    ...prev.precios,
                    [index]: {
                      ...(prev?.precios?.[index] || {}),
                      cantidad: !esValido
                    }
                  }
                }));
              }}
            />

            {camposInvalidos?.precios?.[index]?.cantidad && (
              <p className="input-length" style={{ color: 'red' }}>
                Formato inválido. Usa: "6", "1 - 5" o "12 en adelante"
              </p>
            )}

            <label className="price-unit-label">Precio por docena</label>
            <div className="price-input">
              <span className="currency-symbol">COP</span>
              <input
                type="number"
                placeholder="Ej: 50000"
                min="0"
                step="1"
                value={block.precio}
                onKeyDown={(e) => {
                  if (
                    ['e', 'E', '+', '-', ','].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, ''); 
                  updatePriceBlock(block.id, 'precio', raw);

                  const parsed = parseFloat(raw);
                  if (
                    camposInvalidos?.precios?.[index]?.precio &&
                    !isNaN(parsed) &&
                    parsed > 0
                  ) {
                    setCamposInvalidos((prev) => ({
                      ...prev,
                      precios: {
                        ...prev.precios,
                        [index]: {
                          ...prev.precios[index],
                          precio: false
                        }
                      }
                    }));
                  }
                }}
                className={camposInvalidos?.precios?.[index]?.precio ? 'input-error' : ''}
              />

            </div>
          </fieldset>

          {priceBlocks.length > 1 && (
            <button
              type="button"
              className="add-price delete"
              onClick={() => handleRemovePriceBlock(block.id)}
            >
              Eliminar
            </button>
          )}
        </div>
      ))}

      {priceBlocks.length < 3 && (
        <button
          type="button"
          className="add-price"
          onClick={handleAddPriceBlock}
        >
          Agregar precio
        </button>
      )}

      <button type="submit">Guardar producto</button>
    </div>
  );
};

export default InputPrices;
