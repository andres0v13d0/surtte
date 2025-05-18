import { ClipLoader } from 'react-spinners';

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <ClipLoader color="#fa7e17" size={50} />
    </div>
  );
};

export default Loader;
