import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './AddProduct.css';
import InputImages from '../../components/InputImages/InputImages';
import InputInfoProduct from '../../components/InputInfoProduct/InputInfoProduct';
import InputPrices from '../../components/InputPrices/InputPrices';
import Alert from '../../components/Alert/Alert'; 

const AddProduct = () => {
  const [variantList, setVariantList] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [alertType, setAlertType] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [productReference, setProductReference] = useState('');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('right');
  const [priceBlocks, setPriceBlocks] = useState([
    { id: Date.now(), cantidades: [], inputCantidad: '', precio: '', unidad: 'docena' }
  ]);
  const [categoria, setCategoria] = useState(null);
  const [subcategoria, setSubcategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  console.log(direction);

  const validarStep = (pasoActual) => {
    if (pasoActual === 0 && images.length === 0) {
      setAlertType('error');
      setAlertMessage('Debes subir al menos una imagen.');
      setShowAlert(true);
      return false;
    }
    if (pasoActual === 1) {
      const campos = {};
      if (!productName.trim()) campos.productName = true;
      if (!description.trim()) campos.description = true;
      if (!categoria) campos.categoria = true;

      if (Object.keys(campos).length > 0) {
        setCamposInvalidos(campos);
        setAlertType('error');
        setAlertMessage('Completa todos los campos del producto.');
        setShowAlert(true);
        return false;
      } else {
        setCamposInvalidos({});
      }
    }
    return true;
  };    

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('https://api.surtte.com/categories/with/sub-categories');
        const data = await res.json();

        const formatted = data.map(cat => ({
          label: cat.name,
          options: cat.subCategories.map(sub => ({
            value: sub.id,
            label: sub.name
          }))
        }));

        setCategorias(formatted);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  const subcategorias = categoria ? categorias.find(c => c.label === categoria.label)?.options || [] : [];

  const goToStep = (newStep) => {
    if (newStep > step && !validarStep(step)) return;

    setVariantList(prev => {
      return prev.map(variant => {
        const val = variant.input.trim();
        if (val && !variant.values.includes(val)) {
          return {
            ...variant,
            values: [...variant.values, val],
            input: ''
          };
        }
        return { ...variant, input: '' };
      });
    });

    setDirection(newStep > step ? 'right' : 'left');
    setStep(newStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPriceBlocks(prev => {
        return prev.map(block => {
          const val = block.inputCantidad?.trim();
          if (
            val &&
            !isNaN(val) &&
            Number.isInteger(Number(val)) &&
            Number(val) > 0 &&
            !block.cantidades.includes(val)
          ) {
            return {
              ...block,
              cantidades: [...block.cantidades, val],
              inputCantidad: ''
            };
          }
          return { ...block, inputCantidad: '' };
        });
      });

      for (const block of priceBlocks) {
        const precio = parseFloat((block.precio || '').toString().replace(/\./g, ''));
        const tieneCantidades = Array.isArray(block.cantidades) && block.cantidades.length > 0;
      
        if (!tieneCantidades || isNaN(precio) || precio <= 0) {
          setAlertType('error');
          setAlertMessage('Cada bloque de precio debe tener al menos una cantidad válida y un precio mayor a 0.');
          setShowAlert(true);
          return;
        }
      }

      const user = JSON.parse(localStorage.getItem('usuario'));
      if (!user || user.rol !== 'proveedor' || !user.proveedorInfo?.id) {
        setAlertType('error');
        setAlertMessage('Solo los proveedores pueden agregar productos.');
        setShowAlert(true);
        return;
      }

      const providerId = user.proveedorInfo.id;

      if (!images.length) {
        setAlertType('error');
        setAlertMessage('Debes subir al menos una imagen.');
        setShowAlert(true);
        return;
      }

      if (!productName.trim() || !description.trim() || !categoria) {
        setAlertType('error');
        setAlertMessage('Completa todos los campos requeridos.');
        setShowAlert(true);
        return;
      }

      const searchRes = await fetch(`https://api.surtte.com/products/search/${productName}`);
      const searchJson = await searchRes.json();
      if (searchJson.length > 0) {
        setAlertType('error');
        setAlertMessage('Ya existe un producto con ese nombre.');
        setShowAlert(true);
        return;
      }

      const colors = [];
      const sizes = [];

      for (const variant of variantList) {
        const type = variant.type?.toLowerCase();
        if (type === 'color') {
          variant.values.forEach(color => colors.push({ name: color }));
        } else if (type === 'talla') {
          variant.values.forEach(size => sizes.push({ name: size }));
        }
      }

      const createRes = await fetch('https://api.surtte.com/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          name: productName,
          description,
          reference: productReference,
          categoryId: categoria.value,
          subCategoryId: subcategoria?.value,
          colors,
          sizes
        }),
      });

      const product = await createRes.json();
      const productId = product.id;

      for (const file of images) {
        const mimeType = file.type;
        const filename = file.name;

        const signedRes = await fetch('https://api.surtte.com/images/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mimeType, filename, productId }),
        });

        const { signedUrl, finalUrl } = await signedRes.json();
        await fetch(signedUrl, { method: 'PUT', body: file });

        await fetch('https://api.surtte.com/images/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, imageUrl: finalUrl, temporal: false }),
        });
      }

      for (const block of priceBlocks) {
        const precio = parseFloat((block.precio || '').toString().replace(/\./g, ''));
        if (isNaN(precio) || precio <= 0 || block.cantidades.length === 0) continue;

        const quantity = block.cantidades
          .map(q => parseInt(q))
          .filter(n => !isNaN(n) && n > 0)
          .join(',');

        const description = `Aplica ${quantity} unidades`;

        await fetch('https://api.surtte.com/product-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            quantity,
            unity: block.unidad,
            price: precio,
            description,
          }),
        });
      }

      setImages([]);
      setPreviews([]);
      setProductName('');
      setDescription('');
      setProductReference('');
      setCategoria(null);
      setSubcategoria(null);
      setStep(0);
      setPriceBlocks([{ id: Date.now(), cantidades: [], inputCantidad: '', precio: '', unidad: 'docena' }]);

      setAlertType('success');
      setAlertMessage('Producto guardado exitosamente.');
      setShowAlert(true);
    } catch (err) {
      console.error(err);
      setAlertType('error');
      setAlertMessage('Error al guardar el producto.');
      setShowAlert(true);
    }
  };

  const updatePriceBlock = (id, field, value) => {
    setPriceBlocks(prev =>
      prev.map(block =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
  };

  const handleAddPriceBlock = () => {
    if (priceBlocks.length < 3) {
      setPriceBlocks(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          cantidades: [],
          inputCantidad: '',
          precio: '',
          unidad: 'docena'
        }
      ]);
    }
  };

  const handleRemovePriceBlock = (id) => {
    setPriceBlocks(priceBlocks.filter(block => block.id !== id));
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
      <div className="add-product-container">
        <h2 className="add-title">Agrega tu producto</h2>
        <form className={`step-wrapper step-${step}`} onSubmit={handleSubmit}>
          {step === 0 && (
            <InputImages
              images={images}
              previews={previews}
              setImages={setImages}
              setPreviews={setPreviews}
              goToStep={goToStep}
            />
          )}

          {step === 1 && (
            <InputInfoProduct
              productName={productName}
              setProductName={setProductName}
              description={description}
              setDescription={setDescription}
              productReference={productReference}
              setProductReference={setProductReference}
              categoria={categoria}
              setCategoria={setCategoria}
              subcategoria={subcategoria}
              setSubcategoria={setSubcategoria}
              categorias={categorias}
              subcategorias={subcategorias}
              goToStep={goToStep}
              camposInvalidos={camposInvalidos}
              setCamposInvalidos={setCamposInvalidos}
              variantList={variantList} 
              setVariantList={setVariantList}
            />
          )}

          {step === 2 && (
            <InputPrices
              priceBlocks={priceBlocks}
              updatePriceBlock={updatePriceBlock}
              handleAddPriceBlock={handleAddPriceBlock}
              handleRemovePriceBlock={handleRemovePriceBlock}
              goToStep={goToStep}
              camposInvalidos={camposInvalidos}
              setCamposInvalidos={setCamposInvalidos}
            />
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddProduct;
