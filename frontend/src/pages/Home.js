import Footer from '../components/Footer';
import Header from '../components/Header';
import NavInf from '../components/NavInf';
import Product from '../components/Product';

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
  },
  {
    name: "Jersey Selección Colombia 50 Años – Blanco Retro",
    provider: "Gol Apparel",
    stars: 4,
    image: "/camiseta.avif",
    prices: [
      { amount: 43, condition: "(8 o más)" },
      { amount: 46, condition: "(4 a 7)" },
      { amount: 51, condition: "(1 a 3)" },
    ],
  },
  {
    name: "Edición Especial Camiseta Blanca Colombia",
    provider: "ColSports",
    stars: 5,
    image: "/camiseta.avif",
    prices: [
      { amount: 44, condition: "(12+ unidades)" },
      { amount: 47, condition: "(6-11 unidades)" },
      { amount: 52, condition: "(1-5 unidades)" },
    ],
  },
  {
    name: "Camiseta Tributo 50 Años – Color Blanco",
    provider: "Pasión Cafetera",
    stars: 3,
    image: "/camiseta.avif",
    prices: [
      { amount: 40, condition: "(20 o más)" },
      { amount: 44, condition: "(10-19)" },
      { amount: 48, condition: "(1-9)" },
    ],
  },
  {
    name: "Blanca Oficial 50 Años – Colombia Legend",
    provider: "RetroFútbol",
    stars: 4,
    image: "/camiseta.avif",
    prices: [
      { amount: 41, condition: "(15+ unidades)" },
      { amount: 46, condition: "(5-14)" },
      { amount: 49, condition: "(1-4)" },
    ],
  },
  {
    name: "Camiseta Histórica Selección Colombia 50 Años",
    provider: "SelecciónShop",
    stars: 5,
    image: "/camiseta.avif",
    prices: [
      { amount: 43, condition: "(10+ unidades)" },
      { amount: 47, condition: "(5-9 unidades)" },
      { amount: 51, condition: "(1-4 unidades)" },
    ],
  },
  {
    name: "Colombia Blanca 50 Años – Fan Edition",
    provider: "LaCancha Store",
    stars: 4,
    image: "/camiseta.avif",
    prices: [
      { amount: 42, condition: "(10+ unidades)" },
      { amount: 46, condition: "(6-9)" },
      { amount: 50, condition: "(1-5)" },
    ],
  },
  {
    name: "Jersey Blanco Colombia Edición Limitada",
    provider: "FútbolShop",
    stars: 3,
    image: "/camiseta.avif",
    prices: [
      { amount: 44, condition: "(12+ unidades)" },
      { amount: 48, condition: "(5-11)" },
      { amount: 52, condition: "(1-4)" },
    ],
  },
  {
    name: "Colección Blanca Colombia 50 Aniversario",
    provider: "Deporte Nacional",
    stars: 5,
    image: "/camiseta.avif",
    prices: [
      { amount: 41, condition: "(15+ unidades)" },
      { amount: 45, condition: "(7-14)" },
      { amount: 49, condition: "(1-6)" },
    ],
  },
  {
    name: "Colombia 50 Años - Blanca Premium",
    provider: "Café y Gol",
    stars: 4,
    image: "/camiseta.avif",
    prices: [
      { amount: 43, condition: "(10 o más unidades)" },
      { amount: 47, condition: "(4 a 9 unidades)" },
      { amount: 53, condition: "(1 a 3 unidades)" },
    ],
  }
];

function Home() {
  return (
    <>
      <Header />
      <div className='products-cont'>
        {mockProducts.map((prod, index) => (
          <Product key={index} {...prod} />
        ))}
      </div>
      <NavInf selected={"home"} />
      <Footer />
    </>
  );
}

export default Home;
