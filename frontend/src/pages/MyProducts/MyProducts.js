import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Product from '../../components/Product/Product';
import './MyProducts.css';
import { useNavigate } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const mockProducts = [
  {
    name: "Camiseta Clásica Colombia Blanca - Ed. 50 Años",
    provider: "Fútbol Total",
    stars: 5,
    image: "/camiseta.avif",
    prices: [
      { amount: 42, condition: "(10 o más unidades)" },
      { amount: 45, condition: "(5 a 9 unidades)" },
      { amount: 50, condition: "(1 a 4 unidades)" },
    ],
  }
];

function MyProducts() {

    const navigate = useNavigate();

    const addProduct = () => {
      navigate("/add-product");
    }

  return (
    <>
      <Header />
      <div className='products-cont'>
        {mockProducts.map((prod, index) => (
          <Product key={index} {...prod} />
        ))}
        <div className='products-add' onClick={() => addProduct()}>
          <div className='add-button'><FontAwesomeIcon icon={faPlus}/></div>
        </div>
      </div>
      <NavInf selected={"profile"} />
      <Footer />
    </>
  );
}

export default MyProducts;
