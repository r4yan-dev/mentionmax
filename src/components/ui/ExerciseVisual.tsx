import type { ExerciseVisual } from "../../types/content";
import "./ExerciseVisual.css";

function mapX(value: number, min: number, max: number) {
  return 42 + ((value - min) / (max - min || 1)) * 316;
}

function mapY(value: number, min: number, max: number) {
  return 184 - ((value - min) / (max - min || 1)) * 150;
}

function pathFromPoints(points: { x: number; y: number }[], xMin: number, xMax: number, yMin: number, yMax: number) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${mapX(point.x, xMin, xMax).toFixed(1)} ${mapY(point.y, yMin, yMax).toFixed(1)}`).join(" ");
}

export function ExerciseVisual({ visual }: { visual?: ExerciseVisual }) {
  if (!visual) return null;

  if (visual.kind === "scheme") {
    const byId = new Map(visual.nodes.map((node) => [node.id, node]));
    return (
      <figure className="exercise-visual exercise-visual--scheme">
        {visual.title && <figcaption>{visual.title}</figcaption>}
        <svg viewBox="0 0 400 210" role="img" aria-label={visual.ariaLabel || visual.title || "Schéma de l’exercice"}>
          <defs>
            <marker id="mm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
          {visual.links.map((link, index) => {
            const from = byId.get(link.from);
            const to = byId.get(link.to);
            if (!from || !to) return null;
            return (
              <g key={`link-${index}`} className="exercise-visual-link">
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeDasharray={link.dashed ? "6 5" : undefined} markerEnd="url(#mm-arrow)" />
                {link.label && <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} textAnchor="middle">{link.label}</text>}
              </g>
            );
          })}
          {visual.nodes.map((node) => (
            <g key={node.id} className="exercise-visual-node">
              <rect x={node.x - 44} y={node.y - 20} width="88" height="40" rx="10" />
              <text x={node.x} y={node.y + 5} textAnchor="middle">{node.label}</text>
            </g>
          ))}
        </svg>
      </figure>
    );
  }

  const xMin = visual.xMin ?? -5;
  const xMax = visual.xMax ?? 5;
  const yMin = visual.yMin ?? -4;
  const yMax = visual.yMax ?? 4;
  const xAxisY = mapY(0, yMin, yMax);
  const yAxisX = mapX(0, xMin, xMax);
  const curves = visual.curves ?? [];
  const points = visual.points ?? [];

  return (
    <figure className="exercise-visual exercise-visual--graph">
      {visual.title && <figcaption>{visual.title}</figcaption>}
      <svg viewBox="0 0 400 210" role="img" aria-label={visual.ariaLabel || visual.title || "Graphique de l’exercice"}>
        <g className="exercise-visual-grid">
          {Array.from({ length: 9 }).map((_, index) => {
            const value = xMin + ((xMax - xMin) * index) / 8;
            const x = mapX(value, xMin, xMax);
            return <line key={`gx-${index}`} x1={x} y1="34" x2={x} y2="184" />;
          })}
          {Array.from({ length: 7 }).map((_, index) => {
            const value = yMin + ((yMax - yMin) * index) / 6;
            const y = mapY(value, yMin, yMax);
            return <line key={`gy-${index}`} x1="42" y1={y} x2="358" y2={y} />;
          })}
        </g>
        <line className="exercise-visual-axis" x1="42" y1={xAxisY} x2="358" y2={xAxisY} markerEnd="url(#mm-arrow)" />
        <line className="exercise-visual-axis" x1={yAxisX} y1="184" x2={yAxisX} y2="34" markerEnd="url(#mm-arrow)" />
        {visual.xLabel && <text className="exercise-visual-axis-label" x="350" y={Math.min(202, xAxisY - 8)} textAnchor="end">{visual.xLabel}</text>}
        {visual.yLabel && <text className="exercise-visual-axis-label" x={Math.min(386, yAxisX + 12)} y="28">{visual.yLabel}</text>}
        {curves.map((curve, index) => (
          <path key={`curve-${index}`} className="exercise-visual-curve" d={pathFromPoints(curve.points, xMin, xMax, yMin, yMax)} strokeDasharray={curve.dashed ? "7 6" : undefined} />
        ))}
        {points.map((point, index) => (
          <g key={`point-${index}`}>
            <circle className="exercise-visual-point" cx={mapX(point.x, xMin, xMax)} cy={mapY(point.y, yMin, yMax)} r="4.5" />
            {point.label && <text className="exercise-visual-point-label" x={mapX(point.x, xMin, xMax) + 7} y={mapY(point.y, yMin, yMax) - 7}>{point.label}</text>}
          </g>
        ))}
      </svg>
      {(curves.some((curve) => curve.label) || points.some((point) => point.label)) && (
        <div className="exercise-visual-legend">
          {curves.filter((curve) => curve.label).map((curve, index) => <span key={`legend-c-${index}`}><i className="exercise-visual-legend-line" />{curve.label}</span>)}
          {points.filter((point) => point.label).map((point, index) => <span key={`legend-p-${index}`}><i className="exercise-visual-legend-dot" />{point.label}</span>)}
        </div>
      )}
    </figure>
  );
}

export default ExerciseVisual;
