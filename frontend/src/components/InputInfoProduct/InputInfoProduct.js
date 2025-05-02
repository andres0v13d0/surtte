import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './InputInfoProduct.css';

const InputInfoProduct = ({
  productName,
  setProductName,
  description,
  setDescription,
  productReference,
  setProductReference,
  categoria,
  setCategoria,
  subcategoria,
  setSubcategoria,
  categorias,
  subcategorias,
  goToStep,
  camposInvalidos,
  setCamposInvalidos,
  variantList,
  setVariantList,
}) => {

  const handleVariantInput = (index, input) => {
    const updatedList = [...variantList];
    updatedList[index].input = input;

    if (input.includes(',')) {
      const parts = input.split(',').map(p => p.trim()).filter(p => p);
      parts.forEach((val) => {
        if (!updatedList[index].values.includes(val)) {
          updatedList[index].values.push(val);
        }
      });
      updatedList[index].input = '';
    }

    setVariantList(updatedList);
  };

  const removeVariantValue = (vIndex, valIndex) => {
    const updatedList = [...variantList];
    updatedList[vIndex].values.splice(valIndex, 1);
    setVariantList(updatedList);
  };

  const removeVariant = (indexToRemove) => {
    const updatedList = [...variantList];
    updatedList.splice(indexToRemove, 1);
    setVariantList(updatedList);
  };

  const updateVariantType = (index, selected) => {
    const updatedList = [...variantList];
    updatedList[index].type = selected?.value || null;
    updatedList[index].values = [];
    updatedList[index].input = '';
    setVariantList(updatedList);
  };

  const usedTypes = variantList.map(v => v.type).filter(Boolean);
  const availableOptions = ['Color', 'Talla'].filter(opt => !usedTypes.includes(opt));

  return (
    <div className="step slide-in">
      <div className='step-sup'>
        <button id="btn-back" type="button" onClick={() => goToStep(0)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div>
          <h1>Paso 2 de 3</h1>
          <h2>Información del producto</h2>
        </div>
      </div>

      <label>Nombre del producto</label>
      <input
        type="text"
        value={productName}
        maxLength={50}
        onChange={(e) => {
          setProductName(e.target.value);
          if (camposInvalidos?.productName && e.target.value.trim()) {
            setCamposInvalidos(prev => ({ ...prev, productName: false }));
          }
        }}
        placeholder="Ej: Vestido floral de verano para mujer"
        className={camposInvalidos?.productName ? 'input-error' : ''}
      />
      <p className="input-length">
        <b>Caracteres:</b> {productName.length} / 50
      </p>

      <label>Descripción</label>
      <textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          if (camposInvalidos?.description && e.target.value.trim()) {
            setCamposInvalidos(prev => ({ ...prev, description: false }));
          }
        }}
        maxLength={200}
        placeholder="Ej: Vestido casual con estampado floral, ideal para días soleados. Tela ligera y fresca. Disponible en varias tallas y colores."
        className={camposInvalidos?.description ? 'input-error' : ''}
      />
      <p className="input-length">
        <b>Caracteres:</b> {description.length} / 200
      </p>

      <label>Referencia del producto (Opcional)</label>
      <input
        type="text"
        value={productReference}
        maxLength={50}
        onChange={(e) => {
          setProductReference(e.target.value);
          if (camposInvalidos?.productReference && e.target.value.trim()) {
            setCamposInvalidos(prev => ({ ...prev, productReference: false }));
          }
        }}
        placeholder="Ej: SM-360L"
        className={camposInvalidos?.productReference ? 'input-error' : ''}
      />

      <div className='category-container'>
        <label>Categoría</label>
        <Select
          classNamePrefix={`mi${camposInvalidos?.categoria ? ' input-error-select' : ''}`}
          options={categorias.map(cat => ({ value: cat.id, label: cat.label }))}
          placeholder="Seleccionar categoría..."
          value={categoria}
          onChange={(selected) => {
            setCategoria(selected);
            setSubcategoria(null);
          }}
          isClearable
        />

        <label>Subcategoría</label>
        <Select
          classNamePrefix={`mi${camposInvalidos?.categoria ? ' input-error-select' : ''}`}
          options={subcategorias}
          placeholder="Seleccionar subcategoría..."
          value={subcategoria}
          onChange={setSubcategoria}
          isDisabled={!categoria}
          isClearable
        />
      </div>

      <div className="variant-section">
        {variantList.map((variant, index) => (
          <div key={index} className="variant-block">
            <label>Tipo de variante</label>
            <Select
              options={availableOptions.map(opt => ({ value: opt, label: opt }))}
              onChange={(selected) => updateVariantType(index, selected)}
              placeholder="Seleccionar tipo..."
              value={variant.type ? { value: variant.type, label: variant.type } : null}
              isClearable
              isDisabled={variantList.length > 1 && index === 0 && !!variant.type}
            />

            {variant.type === 'Talla' && (
              <div className="tag-input size">
                {variant.values.map((val, i) => (
                  <div className="tag" key={i}>
                    {val} <span onClick={() => removeVariantValue(index, i)}>×</span>
                  </div>
                ))}
                <input
                  type="text"
                  value={variant.input}
                  onChange={(e) => handleVariantInput(index, e.target.value)}
                  onBlur={() => {
                    if (variant.input.trim()) {
                      const updatedList = [...variantList];
                      const val = variant.input.trim();
                      if (!updatedList[index].values.includes(val)) {
                        updatedList[index].values.push(val);
                      }
                      updatedList[index].input = '';
                      setVariantList(updatedList);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (['Enter', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                      const updatedList = [...variantList];
                      const val = variant.input.trim();
                      if (val && !updatedList[index].values.includes(val)) {
                        updatedList[index].values.push(val);
                      }
                      updatedList[index].input = '';
                      setVariantList(updatedList);
                    }
                  }}
                  placeholder="Ej: S, M, L..."
                  className="size-input"
                />
              </div>
            )}


            {variant.type === 'Color' && (
              <div className="tag-input size">
                {variant.values.map((val, i) => (
                  <div className="tag" key={i}>
                    {val} <span onClick={() => removeVariantValue(index, i)}>×</span>
                  </div>
                ))}
                <input
                  type="text"
                  value={variant.input}
                  onChange={(e) => handleVariantInput(index, e.target.value)}
                  onBlur={() => {
                    if (variant.input.trim()) {
                      const updatedList = [...variantList];
                      const val = variant.input.trim();
                      if (!updatedList[index].values.includes(val)) {
                        updatedList[index].values.push(val);
                      }
                      updatedList[index].input = '';
                      setVariantList(updatedList);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (['Enter', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                      const updatedList = [...variantList];
                      const val = variant.input.trim();
                      if (val && !updatedList[index].values.includes(val)) {
                        updatedList[index].values.push(val);
                      }
                      updatedList[index].input = '';
                      setVariantList(updatedList);
                    }
                  }}
                  placeholder="Ej: Rojo, Azul..."
                  className="size-input"
                />
              </div>
            )}



            <button
              type="button"
              className="add-price delete variants"
              onClick={() => removeVariant(index)}
            >
              Eliminar variante
            </button>
          </div>
        ))}

        {variantList.length < 2 && (
          <button
            type="button"
            className="add-price"
            onClick={() => {
              setVariantList([...variantList, { type: null, values: [], input: '' }]);
            }}
          >
            Agregar variante
          </button>
        )}
      </div>

      <button type="button" onClick={() => goToStep(2)}>Siguiente</button>
    </div>
  );
};

export default InputInfoProduct;
