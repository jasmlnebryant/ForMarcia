export default function DogDash({ size = 120 }) {
  return (
    <img
      src="/dash-mascot.jpeg"
      alt="Dash"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
}
