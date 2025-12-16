export default function CryptoGridLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className="inline-block"
    >
      {/* Front face grid */}
      <line x1="4" y1="4" x2="28" y2="4" />
      <line x1="4" y1="28" x2="28" y2="28" />
      <line x1="4" y1="4" x2="4" y2="28" />
      <line x1="28" y1="4" x2="28" y2="28" />
      
      {/* Inner grid lines - front face */}
      <line x1="4" y1="12" x2="28" y2="12" />
      <line x1="4" y1="20" x2="28" y2="20" />
      <line x1="12" y1="4" x2="12" y2="28" />
      <line x1="20" y1="4" x2="20" y2="28" />
      
      {/* Back face outline */}
      <line x1="9" y1="9" x2="25" y2="9" />
      <line x1="9" y1="25" x2="25" y2="25" />
      <line x1="9" y1="9" x2="9" y2="25" />
      <line x1="25" y1="9" x2="25" y2="25" />
      
      {/* Connector lines (3D perspective) */}
      <line x1="4" y1="4" x2="9" y2="9" />
      <line x1="28" y1="4" x2="25" y2="9" />
      <line x1="4" y1="28" x2="9" y2="25" />
      <line x1="28" y1="28" x2="25" y2="25" />
    </svg>
  );
}
