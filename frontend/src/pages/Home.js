import Footer from '../components/Footer';
import Header from '../components/Header';
import NavInf from '../components/NavInf';

function Home() {
  return (
    <>
      <Header />
      <NavInf selected={"home"}/>
      <Footer />
    </>
  );
}

export default Home;