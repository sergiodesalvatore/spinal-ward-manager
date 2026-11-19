export default function Brand() {
  return (
    <span className="brand">
      <svg
        width="24"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M13 2c-7 5 6 8-1 14s5 9-1 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 5h10M7 11h11M5 17h11M7 23h11M5 29h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>
        scolioward<span className="brand-caption">Chirurgia vertebrale</span>
      </span>
    </span>
  );
}
