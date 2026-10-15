/** Client-side background removal for studio shots on plain backgrounds: edge flood-fill + soft feather. */
export const cutout = async (blob: Blob, tolerance = 34): Promise<Blob> => {
  const bmp = await createImageBitmap(blob);
  const max = 1024;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const W = Math.round(bmp.width * k), H = Math.round(bmp.height * k);
  const cv = new OffscreenCanvas(W, H);
  const g = cv.getContext('2d')!;
  g.drawImage(bmp, 0, 0, W, H);
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  // reference colour = median-ish of border pixels
  const border: number[][] = [];
  for (let x = 0; x < W; x += 4) border.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y += 4) border.push([0, y], [W - 1, y]);
  const cols = border.map(([x, y]) => { const i = (y! * W + x!) * 4; return [d[i]!, d[i + 1]!, d[i + 2]!]; });
  const med = [0, 1, 2].map((c) => cols.map((p) => p[c]!).sort((a, b) => a - b)[cols.length >> 1]!);
  const dist = (i: number) => Math.hypot(d[i]! - med[0]!, d[i + 1]! - med[1]!, d[i + 2]! - med[2]!);
  const bg = new Uint8Array(W * H);
  const stack: number[] = [];
  for (const [x, y] of border) stack.push(y! * W + x!);
  while (stack.length) {
    const p = stack.pop()!;
    if (bg[p]) continue;
    if (dist(p * 4) > tolerance) continue;
    bg[p] = 1;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }
  const covered = bg.reduce((a, b) => a + b, 0) / (W * H);
  if (covered < 0.08 || covered > 0.97) return blob; // not a plain background: keep the photo
  for (let p = 0; p < W * H; p++) {
    if (bg[p]) { d[p * 4 + 3] = 0; continue; }
    // feather pixels touching the background
    const x = p % W, y = (p / W) | 0;
    let n = 0;
    for (const q of [p - 1, p + 1, p - W, p + W]) if (q >= 0 && q < W * H && Math.abs((q % W) - x) <= 1 && Math.abs(((q / W) | 0) - y) <= 1 && bg[q]) n++;
    if (n) d[p * 4 + 3] = Math.round(255 * (1 - n * 0.2));
  }
  g.putImageData(img, 0, 0);
  return cv.convertToBlob({ type: 'image/png' });
};
