// Earthy/warm palette pairs that feel like Auroville
const PALETTE: [string, string][] = [
  ["#e07a5f", "#f2cc8f"], // terracotta → sand
  ["#81b29a", "#f2cc8f"], // sage → sand
  ["#3d405b", "#81b29a"], // slate → sage
  ["#e07a5f", "#81b29a"], // terracotta → sage
  ["#f4845f", "#f7dc6f"], // coral → gold
  ["#7c9885", "#d4a574"], // forest → clay
  ["#c17767", "#e8d5b7"], // rust → cream
  ["#5f7a8a", "#a8c5b8"], // ocean → mint
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function GeneratedPattern({ seed, className }: { seed: string; className?: string }) {
  const hash = hashString(seed);
  const [color1, color2] = PALETTE[hash % PALETTE.length];
  const angle = hash % 360;
  const patternType = hash % 3;

  const shapes: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const h = hashString(seed + i);
    const x = (h % 80) + 10;
    const y = ((h >> 8) % 80) + 10;
    const size = (h % 40) + 20;
    const opacity = 0.08 + (h % 10) / 100;

    if (patternType === 0) {
      shapes.push(
        <circle key={i} cx={`${x}%`} cy={`${y}%`} r={size} fill="white" opacity={opacity} />
      );
    } else if (patternType === 1) {
      const rotation = h % 45;
      shapes.push(
        <rect
          key={i} x={`${x - 5}%`} y={`${y - 5}%`}
          width={size * 1.5} height={size * 1.5}
          rx={8} fill="white" opacity={opacity}
          transform={`rotate(${rotation} ${x} ${y})`}
        />
      );
    } else {
      const r = size * 0.7;
      const cx = x;
      const cy = y;
      const points = Array.from({ length: 6 }, (_, j) => {
        const a = (Math.PI / 3) * j;
        return `${cx + r * Math.cos(a)}%,${cy + r * Math.sin(a)}%`;
      }).join(" ");
      shapes.push(
        <polygon key={i} points={points} fill="white" opacity={opacity} />
      );
    }
  }

  return (
    <div
      className={className ?? "absolute inset-0"}
      style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }}
    >
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {shapes}
      </svg>
    </div>
  );
}
