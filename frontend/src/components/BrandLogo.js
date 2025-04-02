const BrandLogo = ({ name, size = 40 }) => (
    <img
      src={`/logos/${name}.svg`}
      alt={`${name} logo`}
      width={size}
      height={size}
    />
);
  
export default BrandLogo;