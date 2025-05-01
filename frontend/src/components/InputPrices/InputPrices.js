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

  const handleCantidadInput = (e, blockId) => {
    const inputValue = e.target.value;
    const block = priceBlocks.find(b => b.id === blockId);
  
    const updatedCantidades = Array.isArray(block?.cantidades) ? [...block.cantidades] : [];
    const lastChar = inputValue.slice(-1);
  
    if (lastChar === ',') {
      const value = inputValue.slice(0, -1).trim();
  
      if (
        value &&
        !isNaN(value) &&
        Number.isInteger(Number(value)) &&
        Number(value) > 0 &&
        !updatedCantidades.includes(value)
      ) {
        updatedCantidades.push(value);
        updatePriceBlock(blockId, 'cantidades', updatedCantidades);
      }
  
      updatePriceBlock(blockId, 'inputCantidad', '');
    } else {
      const soloNumeros = /^[0-9]*$/;
      if (soloNumeros.test(inputValue)) {
        updatePriceBlock(blockId, 'inputCantidad', inputValue);
      }
    }
  };
  

  const removeCantidad = (blockId, indexToRemove) => {
    const block = priceBlocks.find(b => b.id === blockId);
    const updatedCantidades = [...block.cantidades];
    updatedCantidades.splice(indexToRemove, 1);
    updatePriceBlock(blockId, 'cantidades', updatedCantidades);
  };

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

      {priceBlocks.map((block, index) => {
        const cantidades = Array.isArray(block.cantidades) ? block.cantidades : [];
        const inputCantidad = block.inputCantidad || '';
        return (
          <div key={block.id}>
            <fieldset className="price-fieldset">
              <label>Cantidades</label>
              <div className="tag-input size">
                {cantidades.map((val, i) => (
                  <div className="tag" key={i}>
                    {val} <span onClick={() => removeCantidad(block.id, i)}>×</span>
                  </div>
                ))}
                <input
                  type="text"
                  value={inputCantidad}
                  onChange={(e) => handleCantidadInput(e, block.id)}
                  placeholder="Ej: 1, 2, 5..."
                  className='size-input'
                />
              </div>

              <p className="input-length">Cantidad en unidades</p>

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
                    if (['e', 'E', '+', '-', ','].includes(e.key)) {
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
        )}
      )}

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
