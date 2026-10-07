export type ImageTransform = { scale: number; x: number; y: number };

export function zoomAtPoint(view: ImageTransform, factor: number, point: { x: number; y: number }): ImageTransform {
  const scale = Math.max(1, Math.min(8, view.scale * factor));
  if (scale <= 1 + 1e-6) return { scale: 1, x: 0, y: 0 };
  const ratio = scale / view.scale;
  return { scale, x: point.x - (point.x - view.x) * ratio, y: point.y - (point.y - view.y) * ratio };
}
