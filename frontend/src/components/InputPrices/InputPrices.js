import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

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
              placeholder="Ej: 1 - 5, 6, 12, 24 en adelante"
              value={block.cantidad}
              onChange={(e) => {
                updatePriceBlock(block.id, 'cantidad', e.target.value);
                if (camposInvalidos?.precios?.[index]?.cantidad && e.target.value.trim()) {
                  setCamposInvalidos((prev) => ({
                    ...prev,
                    precios: {
                      ...prev.precios,
                      [index]: {
                        ...prev.precios[index],
                        cantidad: false
                      }
                    }
                  }));
                }
              }}
              className={camposInvalidos?.precios?.[index]?.cantidad ? 'input-error' : ''}
            />
            <Select
              options={[
                { value: 'unidad', label: 'Precio por unidad' },
                { value: 'docena', label: 'Precio por docena' }
              ]}
              value={block.unidad || { value: 'unidad', label: 'Precio por unidad' }}
              onChange={(selected) => updatePriceBlock(block.id, 'unidad', selected)}
              isClearable
              classNamePrefix={"price-select-unit"}
            />
            <div className="price-input">
              <span className="currency-symbol">COP</span>
              <input
                type="number"
                placeholder="Ej: 50.000"
                value={block.precio}
                onChange={(e) => {
                  updatePriceBlock(block.id, 'precio', e.target.value);
                  const parsed = parseFloat((e.target.value || '').toString().replace(/\./g, ''));
                  if (camposInvalidos?.precios?.[index]?.precio && !isNaN(parsed) && parsed > 0) {
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
