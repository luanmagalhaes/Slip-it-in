interface BlockPatternProps {
  className?: string;
  opacity?: number;
}

const blocks = [
  { x: 4, y: 6, width: 34, height: 15, radius: 6 },
  { x: 44, y: 6, width: 16, height: 15, radius: 6 },
  { x: 66, y: 2, width: 30, height: 19, radius: 7 },
  { x: 2, y: 26, width: 18, height: 16, radius: 6 },
  { x: 26, y: 26, width: 40, height: 16, radius: 6 },
  { x: 72, y: 26, width: 24, height: 16, radius: 6 },
  { x: 8, y: 47, width: 28, height: 14, radius: 5 },
  { x: 42, y: 47, width: 20, height: 14, radius: 5 },
  { x: 68, y: 47, width: 30, height: 14, radius: 5 },
  { x: 0, y: 66, width: 24, height: 17, radius: 6 },
  { x: 30, y: 66, width: 34, height: 17, radius: 6 },
  { x: 70, y: 66, width: 22, height: 17, radius: 6 },
  { x: 14, y: 88, width: 30, height: 12, radius: 5 },
  { x: 52, y: 88, width: 40, height: 12, radius: 5 },
];

export function BlockPattern({ className, opacity = 0.22 }: BlockPatternProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      style={{ opacity }}
    >
      {blocks.map((block) => (
        <rect
          key={`${block.x}-${block.y}`}
          x={block.x}
          y={block.y}
          width={block.width}
          height={block.height}
          rx={block.radius}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
