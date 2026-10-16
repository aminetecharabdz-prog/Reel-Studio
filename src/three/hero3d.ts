import * as THREE from 'three';
import { STYLE_LIST } from '@/styles/catalog';

/**
 * Landing hero, real-time 3D: a pen draws the Rassam mark as a glowing stroke while floating video frames
 * (one per style) orbit behind it. Lazy-loaded; the caller falls back to a static SVG on weak devices.
 */
export type HeroHandle = { dispose: () => void };

const markCurve = () => {
  const v = (x: number, y: number) => new THREE.Vector3((x - 32) / 9, (32 - y) / 9, 0);
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.LineCurve3(v(18, 42), v(18, 12)));
  path.add(new THREE.LineCurve3(v(18, 12), v(47, 29)));
  path.add(new THREE.CubicBezierCurve3(v(47, 29), v(42, 26.5), v(37.5, 29.5), v(38, 35)));
  path.add(new THREE.CubicBezierCurve3(v(38, 35), v(38.5, 44), v(31, 51), v(17, 54)));
  return path;
};

/** a small poster for each style, drawn on a canvas (swatch ground + motif) */
const frameTexture = (i: number) => {
  const s = STYLE_LIST[i % STYLE_LIST.length]!;
  const [bg, ink, accent] = s.swatch;
  const c = document.createElement('canvas');
  c.width = 288;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, c.height);
  // faint grid for drawn styles
  g.strokeStyle = ink + '14';
  g.lineWidth = 1;
  for (let x = 0; x < c.width; x += 24) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, c.height);
    g.stroke();
  }
  for (let y = 0; y < c.height; y += 24) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(c.width, y);
    g.stroke();
  }
  // motif: a hand-drawn arc + accent dot
  g.strokeStyle = ink;
  g.lineWidth = 7;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(144, 230, 70 + (i % 3) * 12, Math.PI * (0.9 + i * 0.07), Math.PI * (2.3 + i * 0.05));
  g.stroke();
  g.fillStyle = accent;
  g.beginPath();
  g.arc(144 + Math.cos(i) * 60, 230 + Math.sin(i) * 60, 16, 0, Math.PI * 2);
  g.fill();
  // title bars (abstract text lines)
  g.fillStyle = ink;
  g.globalAlpha = 0.9;
  g.fillRect(40, 380, 208, 18);
  g.globalAlpha = 0.45;
  g.fillRect(80, 410, 168, 12);
  g.globalAlpha = 1;
  g.fillStyle = accent;
  g.fillRect(40, 440, 60, 8);
  // style name
  g.fillStyle = ink;
  g.font = '600 30px Alexandria, sans-serif';
  g.textAlign = 'center';
  g.direction = 'rtl';
  g.fillText(s.nameAr, 144, 80);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
};

export const mountHero = (host: HTMLElement, opts: { light: boolean }): HeroHandle => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.3, 13);

  scene.add(new THREE.AmbientLight(0xffffff, opts.light ? 1.4 : 0.55));
  const key = new THREE.DirectionalLight(0xffffff, opts.light ? 1.6 : 1.1);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const sparkLight = new THREE.PointLight(0xff7a1a, 30, 9, 1.6);
  scene.add(sparkLight);

  // --- the stroke (tube that grows) ---
  const curve = markCurve();
  const tubeGeo = new THREE.TubeGeometry(curve as unknown as THREE.Curve<THREE.Vector3>, 360, 0.2, 18, false);
  const tubeMat = new THREE.MeshStandardMaterial({ color: opts.light ? 0x13232d : 0xeef2f2, roughness: 0.35, metalness: 0.1, emissive: opts.light ? 0x000000 : 0x223038 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  const totalIdx = tubeGeo.index!.count;
  tubeGeo.setDrawRange(0, 0);
  const markGroup = new THREE.Group();
  markGroup.add(tube);
  scene.add(markGroup);

  // spark: core + additive halo sprite
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 128;
  const hg = haloCanvas.getContext('2d')!;
  const grad = hg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,243,217,1)');
  grad.addColorStop(0.18, 'rgba(255,170,80,0.95)');
  grad.addColorStop(0.45, 'rgba(255,122,26,0.35)');
  grad.addColorStop(1, 'rgba(255,122,26,0)');
  hg.fillStyle = grad;
  hg.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(haloCanvas), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.setScalar(1.1);
  markGroup.add(halo);

  // the pen: a slim body + nib, leaning like a hand holds it
  const pen = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e3441, roughness: 0.4, metalness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 3.2, 24), bodyMat);
  body.position.y = 1.95;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.3, metalness: 0.2, emissive: 0x401800 }));
  band.position.y = 0.6;
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.5, 24), new THREE.MeshStandardMaterial({ color: 0xc9d3d6, roughness: 0.25, metalness: 0.9 }));
  nib.rotation.x = Math.PI;
  nib.position.y = 0.25;
  pen.add(body, band, nib);
  pen.rotation.set(0.5, 0, -0.55);
  pen.scale.setScalar(0.62);
  markGroup.add(pen);

  // --- floating frames, one per style, on an orbit behind the mark ---
  const frames: THREE.Mesh[] = [];
  const frameGeo = new THREE.ShapeGeometry(roundedRect(1.6, 2.84, 0.16));
  // uv for ShapeGeometry: map positions to 0..1
  const pos = frameGeo.attributes.position!;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / 1.6 + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / 2.84 + 0.5;
  }
  frameGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const N = 10;
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ map: frameTexture(i), roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide, transparent: true, opacity: 0.96 }));
    m.scale.setScalar(0.7);
    frames.push(m);
    scene.add(m);
  }

  // faint drafting grid floor
  const grid = new THREE.GridHelper(40, 40, opts.light ? 0xc3c4ba : 0x24363f, opts.light ? 0xdcdcd4 : 0x16252e);
  grid.position.y = -4.2;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.55;
  scene.add(grid);

  // --- interaction & loop ---
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let w0 = 1;
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    w0 = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the mark comfortably framed on tall phones
    camera.position.z = w / h < 0.8 ? 19 : 13;
    camera.updateProjectionMatrix();
    // desktop: the mark lives in the left half (RTL text sits on the right); phones: centred above the headline
    const wide = w / h >= 1.1;
    markGroup.position.set(wide ? -Math.min(4.4, (w / h) * 2.2) : 0, wide ? 0.1 : 4.3, 0);
    markGroup.scale.setScalar(wide ? 0.72 : 0.56);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
  io.observe(host);

  const DRAW = 2.6; // seconds to draw the mark
  const t0 = performance.now();
  let raf = 0;
  const tmp = new THREE.Vector3();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    const k = Math.min(1, t / DRAW);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    // indices per tubular segment = radialSegments * 6
    const per = 18 * 6;
    tubeGeo.setDrawRange(0, Math.floor((totalIdx / per) * e) * per);
    curve.getPointAt(Math.max(0.0001, e), tmp);
    halo.position.copy(tmp);
    halo.scale.setScalar(1.05 + Math.sin(t * 3) * 0.1);
    sparkLight.position.set(tmp.x, tmp.y, 1.2);
    // the pen follows the tip, then lifts away slightly
    const lift = Math.max(0, (t - DRAW) * 0.8);
    pen.position.set(tmp.x, tmp.y + Math.min(0.6, lift * 0.5), 0.3 + Math.min(0.8, lift));
    pen.rotation.z = -0.55 + Math.sin(t * 1.3) * 0.04;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    markGroup.rotation.y = Math.sin(t * 0.35) * 0.18 + pointer.x * 0.25;
    markGroup.rotation.x = pointer.y * 0.12;

    frames.forEach((m, i) => {
      const a = (i / N) * Math.PI * 2 + t * 0.12;
      const r = w0 >= 1.1 ? 3.6 : 3.2;
      m.position.set(markGroup.position.x + Math.sin(a) * r * (w0 >= 1.1 ? 0.95 : 1), markGroup.position.y + Math.sin(a * 2 + i) * 0.4, Math.cos(a) * r - 6);
      m.lookAt(camera.position.x, m.position.y, camera.position.z);
      m.rotation.z += Math.sin(t * 0.5 + i) * 0.04;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.35 + 0.6 * Math.max(0, Math.cos(a));
    });
    camera.position.x = pointer.x * 0.5;
    camera.position.y = 0.3 - pointer.y * 0.3;
    camera.lookAt(0, w0 < 1.1 ? 1.6 : 0, -1.5);
    renderer.render(scene, camera);
  };
  loop();

  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          (x as THREE.MeshStandardMaterial).map?.dispose();
          x.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};

/** whether this device should get the live 3D hero */
export const canRun3D = () => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 8) <= 2) return false;
  if ((nav.deviceMemory ?? 8) < 2) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
};
