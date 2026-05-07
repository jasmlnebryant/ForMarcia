export default function DogGracie({ size = 120 }) {
  return (
    <img
      src="/gracie-mascot.jpeg"
      alt="Gracie"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
}
