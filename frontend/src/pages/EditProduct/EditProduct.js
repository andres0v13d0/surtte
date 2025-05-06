import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InputImages from '../../components/InputImages/InputImages';
import InputInfoProduct from '../../components/InputInfoProduct/InputInfoProduct';
import InputPrices from '../../components/InputPrices/InputPrices';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Footer from '../../components/Footer/Footer';
import Alert from '../../components/Alert/Alert';
import './EditProduct.css';

const EditProduct = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [initialImages, setInitialImages] = useState([]);
  const [initialPreviews, setInitialPreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [priceBlocks, setPriceBlocks] = useState([]);
  const [initialPriceBlocks, setInitialPriceBlocks] = useState([]);

  const [editImages, setEditImages] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  const [editPrices, setEditPrices] = useState(false);

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [productReference, setProductReference] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [subcategoria, setSubcategoria] = useState(null);
  const [variantList, setVariantList] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [alertType, setAlertType] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const subcategorias = categoria ? categorias.find(c => c.label === categoria.label)?.options || [] : [];

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, imgRes, priceRes, catRes] = await Promise.all([
        fetch(`https://api.surtte.com/products/${uuid}`),
        fetch(`https://api.surtte.com/images/by-product/${uuid}`),
        fetch(`https://api.surtte.com/product-prices/product/${uuid}`),
        fetch(`https://api.surtte.com/categories/with/sub-categories`)
      ]);

      const prodData = await prodRes.json();
      const imgData = await imgRes.json();
      const priceData = await priceRes.json();
      const catData = await catRes.json();

      setProductName(prodData.name);
      setDescription(prodData.description);
      setProductReference(prodData.reference);
      setCategoria({ value: prodData.categoryId, label: prodData.categoryName });
      setSubcategoria({ value: prodData.subCategoryId, label: prodData.subCategoryName });
      setVariantList([
        prodData.sizes?.length ? { type: 'Talla', values: prodData.sizes.map(s => s.name), input: '' } : null,
        prodData.colors?.length ? { type: 'Color', values: prodData.colors.map(c => c.name), input: '' } : null,
      ].filter(Boolean));

      setImages(imgData);
      setPreviews(imgData.map(i => i.imageUrl));
      setInitialImages(imgData);
      setInitialPreviews(imgData.map(i => i.imageUrl));

      const formattedPrices = priceData.map((p) => ({
        id: p.id,
        cantidades: p.quantity?.split(',') || [],
        inputCantidad: '',
        precio: p.price,
        unidad: p.unity || 'unidad'
      }));
      setPriceBlocks(formattedPrices);
      setInitialPriceBlocks(formattedPrices);

      const formattedCats = catData.map(cat => ({
        label: cat.name,
        options: cat.subCategories.map(sub => ({
          value: sub.id,
          label: sub.name
        }))
      }));
      setCategorias(formattedCats);
    };

    fetchData();
  }, [uuid]);

  const cancelImageChanges = () => {
    setImages(initialImages);
    setPreviews(initialPreviews);
    setNewImages([]);
    setImagesToDelete([]);
    setEditImages(false);
  };

  const saveImageChanges = async () => {
    const productId = uuid;

    for (const file of newImages) {
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
        body: JSON.stringify({ productId, imageUrl: finalUrl, temporal: false })
      });
    }

    for (const image of imagesToDelete) {
      await fetch(`https://api.surtte.com/images/${image.id}`, { method: 'DELETE' });
    }

    setInitialImages(images);
    setInitialPreviews(previews);
    setNewImages([]);
    setImagesToDelete([]);
    setEditImages(false);
    setAlertType('success');
    setAlertMessage('Imágenes actualizadas exitosamente.');
    setShowAlert(true);
  };

  const cancelInfoChanges = () => {
    setEditInfo(false);
  };

  const saveInfoChanges = async () => {
    if (!productName.trim() || !description.trim() || !categoria) {
      setAlertType('error');
      setAlertMessage('Completa todos los campos requeridos.');
      setShowAlert(true);
      return;
    }

    const colors = [], sizes = [];
    for (const variant of variantList) {
      const type = variant.type?.toLowerCase();
      if (type === 'color') variant.values.forEach(c => colors.push({ name: c }));
      else if (type === 'talla') variant.values.forEach(t => sizes.push({ name: t }));
    }

    await fetch(`https://api.surtte.com/products/${uuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: productName,
        description,
        reference: productReference,
        categoryId: categoria.value,
        subCategoryId: subcategoria?.value || null,
        colors,
        sizes
      })
    });

    setEditInfo(false);
    setAlertType('success');
    setAlertMessage('Información actualizada exitosamente.');
    setShowAlert(true);
  };

  const cancelPriceChanges = () => {
    setPriceBlocks(initialPriceBlocks.map(p => ({ ...p, inputCantidad: '' })));
    setEditPrices(false);
  };

  const savePriceChanges = async () => {
    for (const block of priceBlocks) {
      const precio = parseFloat((block.precio || '').toString().replace(/\./g, ''));
      if (!block.cantidades.length || isNaN(precio) || precio <= 0) {
        setAlertType('error');
        setAlertMessage('Cada bloque de precio debe tener cantidades válidas y precio mayor a 0.');
        setShowAlert(true);
        return;
      }
    }

    const created = priceBlocks.filter(p => !initialPriceBlocks.find(b => b.id === p.id));
    const updated = priceBlocks.filter(p => initialPriceBlocks.find(b => b.id === p.id && (b.precio !== p.precio || b.cantidades.join(',') !== p.cantidades.join(','))));
    const deleted = initialPriceBlocks.filter(b => !priceBlocks.find(p => p.id === b.id));

    for (const block of created) {
      await fetch('https://api.surtte.com/product-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: uuid,
          quantity: block.cantidades.join(','),
          unity: block.unidad,
          price: parseFloat(block.precio),
          description: `Aplica ${block.cantidades.join(',')} unidades`
        })
      });
    }

    for (const block of updated) {
      await fetch(`https://api.surtte.com/product-prices/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: block.cantidades.join(','),
          unity: block.unidad,
          price: parseFloat(block.precio),
          description: `Aplica ${block.cantidades.join(',')} unidades`
        })
      });
    }

    for (const block of deleted) {
      await fetch(`https://api.surtte.com/product-prices/${block.id}`, {
        method: 'DELETE' });
    }

    setInitialPriceBlocks(priceBlocks);
    setEditPrices(false);
    setAlertType('success');
    setAlertMessage('Precios actualizados exitosamente.');
    setShowAlert(true);
  };

  const handleDeleteProduct = async () => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://api.surtte.com/products/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setAlertType('success');
        setAlertMessage('Producto eliminado exitosamente.');
        setShowAlert(true);
        setTimeout(() => navigate('/my-products'), 2000);
      } else throw new Error();
    } catch {
      setAlertType('error');
      setAlertMessage('Error al eliminar el producto.');
      setShowAlert(true);
    }
  };

  return (
    <>
      {showAlert && (
        <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      <Header 
        minimal={true}
        providerName={JSON.parse(localStorage.getItem('usuario'))?.proveedorInfo?.nombre_empresa}
        menuProvider={true}
        currentPage='products'
      />
      <div className="edit-product-container">
        <div className="edit-block">
          <h2>Imágenes</h2>
          <InputImages
            images={images}
            previews={previews}
            setImages={setImages}
            setPreviews={setPreviews}
            editMode={true}
            editActive={editImages}
            setNewImages={setNewImages}
            setImagesToDelete={setImagesToDelete}
          />
          <div className="edit-controls">
            {editImages ? (
              <>
                <button className='cancel-btn' onClick={cancelImageChanges}>Cancelar</button>
                <button className='save-btn' onClick={saveImageChanges}>Guardar cambios</button>
              </>
            ) : (
              <button className='edit-btn' onClick={() => setEditImages(true)}>Editar</button>
            )}
          </div>
        </div>

        <div className='line'></div>

        <div className="edit-block">
          <h2>Información</h2>
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
            variantList={variantList}
            setVariantList={setVariantList}
            editMode={true}
            editActive={editInfo}
          />
          <div className="edit-controls">
            {editInfo ? (
              <>
                <button className='cancel-btn' onClick={cancelInfoChanges}>Cancelar</button>
                <button className='save-btn' onClick={saveInfoChanges}>Guardar cambios</button>
              </>
            ) : (
              <button className='edit-btn' onClick={() => setEditInfo(true)}>Editar</button>
            )}
          </div>
        </div>

        <div className='line'></div>

        <div className="edit-block">
          <h2>Precios</h2>
          <InputPrices
            priceBlocks={priceBlocks}
            updatePriceBlock={(id, field, value) => {
              setPriceBlocks((prev) =>
                prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
              );
            }}
            handleAddPriceBlock={() => {
              if (priceBlocks.length < 3) {
                setPriceBlocks([...priceBlocks, { id: Date.now(), cantidades: [], inputCantidad: '', precio: '', unidad: 'docena' }]);
              }
            }}
            handleRemovePriceBlock={(id) => {
              setPriceBlocks(priceBlocks.filter((b) => b.id !== id));
            }}
            editMode={true}
            editActive={editPrices}
          />
          <div className="edit-controls">
            {editPrices ? (
              <>
                <button className='cancel-btn' onClick={cancelPriceChanges}>Cancelar</button>
                <button className='save-btn' onClick={savePriceChanges}>Guardar cambios</button>
              </>
            ) : (
              <button className='edit-btn' onClick={() => setEditPrices(true)}>Editar</button>
            )}
          </div>
        </div>

        <div className="line"></div>

        <div className="edit-block">
          <div className="edit-controls">
            <button className='delete-btn' onClick={handleDeleteProduct}>Eliminar producto</button>
          </div>
        </div>
      </div>
      <NavInf />
      <Footer />
    </>
  );
};

export default EditProduct;
