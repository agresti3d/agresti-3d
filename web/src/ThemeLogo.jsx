export default function ThemeLogo({ width = 38, height = 38, className = "", alt = "" }) {
  return (
    <>
      <img src="/assets/logo/agresti-a-claro.svg" alt={alt} width={width} height={height} className={`theme-logo-dark ${className}`} />
      <img src="/assets/logo/agresti-a-oscuro.svg" alt={alt} width={width} height={height} className={`theme-logo-light ${className}`} />
    </>
  );
}
