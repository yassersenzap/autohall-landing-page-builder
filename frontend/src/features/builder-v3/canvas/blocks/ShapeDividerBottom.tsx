type ShapeDividerBottomProps = {
  className?: string;
};

export function ShapeDividerBottom({ className }: ShapeDividerBottomProps) {
  return (
    <div
      className={`pointer-events-none absolute bottom-0 left-0 z-2 w-full overflow-hidden leading-none ${className ?? ''}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="relative block h-[60px] w-full sm:h-[80px]"
      >
        <path
          d="M0,32 C200,90 400,0 600,40 C800,80 1000,10 1200,48 L1200,80 L0,80 Z"
          fill="currentColor"
          className="text-white"
        />
      </svg>
    </div>
  );
}
