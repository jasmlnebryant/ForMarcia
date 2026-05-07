export default function DogMako({ size = 120 }) {
  return (
    <img
      src="/mako-mascot.jpeg"
      alt="Mako"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
}
