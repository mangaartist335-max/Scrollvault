export default function DinoRunIcon() {
  const px = 4;
  const ox = 18;
  const oy = 14;

  const body = [
    [3, 1],
    [4, 1],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [2, 5],
    [3, 5],
    [2, 6],
    [3, 6],
    [4, 6],
    [3, 7],
    [4, 7],
    [4, 8],
  ];

  const outline = [
    [2, 1],
    [5, 1],
    [1, 2],
    [6, 2],
    [1, 3],
    [6, 3],
    [1, 4],
    [5, 4],
    [1, 5],
    [4, 5],
    [1, 6],
    [5, 6],
    [2, 7],
    [5, 7],
    [3, 8],
    [5, 8],
    [4, 9],
  ];

  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label="Dino Run?" shapeRendering="crispEdges">
      {outline.map(([x, y], i) => (
        <rect key={`o${i}`} x={ox + x * px} y={oy + y * px} width={px} height={px} fill="var(--dino-black)" />
      ))}
      {body.map(([x, y], i) => (
        <rect key={`b${i}`} x={ox + x * px} y={oy + y * px} width={px} height={px} fill="var(--dino-white)" />
      ))}
    </svg>
  );
}

