import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState('right');
    const [priceBlocks, setPriceBlocks] = useState([
        { id: Date.now(), cantidad: '', precio: '' }
    ]);
    const [categoria, setCategoria] = useState(null);
    const [subcategoria, setSubcategoria] = useState(null);
    const [categorias, setCategorias] = useState([]);


    const validarCantidad = (texto) => {
        texto = texto.trim();

        const enAdelanteRegex = /^(\d+)\s+en\s+adelante$/i;
        const matchEnAdelante = texto.match(enAdelanteRegex);
        if (matchEnAdelante) {
            return {
            valido: true,
            tipo: 'enAdelante',
            cantidad: parseInt(matchEnAdelante[1])
            };
        }

        const rangoRegex = /^(\d+)\s*-\s*(\d+)$/;
        const matchRango = texto.match(rangoRegex);
        if (matchRango) {
            const min = parseInt(matchRango[1]);
            const max = parseInt(matchRango[2]);
            if (min < max) {
            return {
                valido: true,
                tipo: 'rango',
                min,
                max
            };
            }
        }

        const exactoRegex = /^\d+$/;
        if (exactoRegex.test(texto)) {
            return {
            valido: true,
            tipo: 'exacto',
            cantidad: parseInt(texto)
            };
        }

        return { valido: false };
    };

    
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

        if (pasoActual === 2) {
            const errores = [];
            const unidadesPorTipo = { unidades: 0, docenas: 0 };
            const erroresPorBloque = {};

            priceBlocks.forEach((block, index) => {
                const precio = parseFloat((block.precio || '').toString().replace(/\./g, ''));
                const cantidad = block.cantidad.trim();
                const resultado = validarCantidad(cantidad);

                const esPrecioValido = !isNaN(precio) && precio > 0;

                if (!resultado.valido || !esPrecioValido) {
                errores.push(`Cantidad o precio inválido en un bloque.`);
                erroresPorBloque[index] = {
                    cantidad: !resultado.valido,
                    precio: !esPrecioValido,
                };
                }

                if (resultado.tipo === 'mas') {
                unidadesPorTipo[resultado.unidad]++;
                }
            });

            if (errores.length > 0) {
                setCamposInvalidos(prev => ({ ...prev, precios: erroresPorBloque }));
                setAlertType('error');
                setAlertMessage(errores[0]);
                setShowAlert(true);
                return false;
            }

            for (const unidad in unidadesPorTipo) {
                if (unidadesPorTipo[unidad] > 1) {
                setAlertType('error');
                setAlertMessage(`Solo puedes poner una condición 'en adelante' por tipo de unidad (${unidad}).`);
                setShowAlert(true);
                return false;
                }
            }

            setCamposInvalidos(prev => ({ ...prev, precios: {} }));
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

    
    console.log(direction);

    const subcategorias = categoria ? categorias.find(c => c.label === categoria.label)?.options || [] : [];

    const goToStep = (newStep) => {
        if (newStep > step && !validarStep(step)) return;
        setDirection(newStep > step ? 'right' : 'left');
        setStep(newStep);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
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
      
          // Crear producto
          const createRes = await fetch('https://api.surtte.com/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              providerId,
              name: productName,
              description,
              categoryId: categoria.value,
              subCategoryId: subcategoria?.value,
            }),
          });
      
          const product = await createRes.json();
          const productId = product.id;
      
          // Subir imágenes
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
      
          // Enviar variantes
          for (const variant of variantList) {
            const nameLower = variant.name?.toLowerCase();
      
            if (nameLower === 'talla') {
              await fetch('https://api.surtte.com/sizes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: variant.value }),
              });
            } else if (nameLower === 'color') {
              await fetch('https://api.surtte.com/colors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: variant.value }),
              });
            }
          }
      
          // Enviar precios
          for (const block of priceBlocks) {
            const precio = parseFloat((block.precio || '').toString().replace(/\./g, ''));
            const unidad = block.unidad?.value;
            const cantidad = block.cantidad.trim();
            const resultado = validarCantidad(cantidad);
      
            let minQuantity = 0;
            let maxQuantity = 0;
            let description = '';
      
            if (resultado.tipo === 'rango') {
              minQuantity = resultado.min;
              maxQuantity = resultado.max;
              description = `${minQuantity} a ${maxQuantity} ${unidad === 'docena' ? 'docenas' : 'unidades'}`;
            } else if (resultado.tipo === 'exacto') {
              minQuantity = maxQuantity = resultado.cantidad;
              description = `${resultado.cantidad} ${unidad === 'docena' ? 'docenas' : 'unidades'}`;
            } else if (resultado.tipo === 'enAdelante') {
              minQuantity = resultado.cantidad;
              maxQuantity = 50;
              description = `${resultado.cantidad} en adelante`;
            } else {
              continue; // si no pasa validación, lo ignora
            }
      
            await fetch('https://api.surtte.com/product-prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId,
                minQuantity,
                maxQuantity,
                unity: unidad,
                price: precio,
                description,
              }),
            });
          }
      
          // Reset
          setImages([]);
          setPreviews([]);
          setProductName('');
          setDescription('');
          setCategoria(null);
          setSubcategoria(null);
          setStep(0);
          setPriceBlocks([{ id: Date.now(), cantidad: '', precio: '', unidad: null }]);
      
          setAlertType('success');
          setAlertMessage('Producto guardado exitosamente.');
          setShowAlert(true);
          navigate('/my-products');
      
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
            setPriceBlocks([...priceBlocks, { id: Date.now() + Math.random() }]);
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