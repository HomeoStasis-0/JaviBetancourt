import * as THREE from "three";

export type Shape = {
  object: THREE.Object3D;
  /** Optional pointer interaction. Coordinates are CSS pixels in the viewport. */
  interact?: {
    /** Highlight the node under the pointer (pass null when there is no pointer). Returns true if over a node. */
    hover: (px: number | null, py: number | null, camera: THREE.Camera, w: number, h: number) => boolean;
    /** Fire a signal from the hovered / nearest node. Returns true if something was activated. */
    activate: (animated: boolean) => boolean;
  };
  update: (time: number, dt: number) => void;
  dispose: () => void;
};

// ---------- computer-science shapes ----------

function glowTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 32;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(cv);
}

/** Drifting code glyphs ({ } </> 0 1 ...) as glowing sprites. */
function glyphField(track: <T extends { dispose: () => void }>(x: T) => T, count = 34) {
  const group = new THREE.Group();
  // Syntax from the skills list: Python, C++, C, C#, SQL, Java, JavaScript, HTML, CSS, Unreal Engine, Git, Linux
  const tokens: [string, string][] = [
    ["def main():", "#5fd4ff"],
    ["print()", "#5fd4ff"],
    ["#include", "#7fa8ff"],
    ["std::vector", "#7fa8ff"],
    ["int main()", "#7fa8ff"],
    ["nullptr", "#7fa8ff"],
    ["using System;", "#b48bff"],
    ["async Task", "#b48bff"],
    ["SELECT * FROM", "#ff7de0"],
    ["JOIN ON", "#ff7de0"],
    ["public static", "#ffb066"],
    ["new ArrayList<>()", "#ffb066"],
    ["const fn = () =>", "#ffe27a"],
    ["await fetch()", "#ffe27a"],
    ["<div class>", "#ff8a6b"],
    ["</html>", "#ff8a6b"],
    ["display: flex;", "#6bf0c0"],
    ["UCLASS()", "#e8f6ff"],
    ["AActor*", "#e8f6ff"],
    ["git commit -m", "#ff6b6b"],
    ["git push", "#ff6b6b"],
    ["sudo apt", "#a8e86b"],
    ["ls -la", "#a8e86b"],
    ["chmod +x", "#a8e86b"],
  ];
  const mats = tokens.map(([tk, color]) => {
    const cv = document.createElement("canvas");
    cv.width = 320;
    cv.height = 64;
    const c = cv.getContext("2d")!;
    c.font = "700 30px ui-monospace, Menlo, Consolas, monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.shadowColor = color;
    c.shadowBlur = 10;
    c.fillStyle = color;
    c.fillText(tk, 160, 32);
    const tex = track(new THREE.CanvasTexture(cv));
    return track(
      new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    );
  });
  const items: { s: THREE.Sprite; speed: number }[] = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mats[i % mats.length]);
    const a = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 0.8;
    s.position.set(Math.cos(a) * r, -1.8 + Math.random() * 3.8, Math.sin(a) * r);
    const k = 0.1 + Math.random() * 0.07;
    s.scale.set(k * 5, k, 1);
    group.add(s);
    items.push({ s, speed: 0.06 + Math.random() * 0.14 });
  }
  return {
    group,
    update: (dt: number) => {
      for (const it of items) {
        it.s.position.y += it.speed * dt;
        if (it.s.position.y > 2.0) it.s.position.y = -1.9;
      }
    },
  };
}

/** A small feed-forward neural network with signals pulsing between layers. */
function neural(): Shape {
  const g = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };
  const sizes = [4, 7, 9, 9, 7, 4, 3];
  const layers: THREE.Vector3[][] = sizes.map((n, li) =>
    Array.from({ length: n }, (_, i) => {
      const y = (i - (n - 1) / 2) * 0.4;
      const ang = (i / n) * Math.PI * 2 + li;
      return new THREE.Vector3((li - (sizes.length - 1) / 2) * 0.62, y, Math.sin(ang) * 0.3);
    })
  );
  const lines: number[] = [];
  const conns: [THREE.Vector3, THREE.Vector3][] = [];
  const connIdx: [number, number][] = [];
  const offsets: number[] = [];
  const layerOf: number[] = [];
  {
    let o = 0;
    layers.forEach((L, li) => {
      offsets.push(o);
      L.forEach(() => layerOf.push(li));
      o += L.length;
    });
  }
  for (let l = 0; l < layers.length - 1; l++) {
    layers[l].forEach((a, ia) => {
      layers[l + 1].forEach((b, ib) => {
        lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
        conns.push([a, b]);
        connIdx.push([offsets[l] + ia, offsets[l + 1] + ib]);
      });
    });
  }
  const lineGeo = track(new THREE.BufferGeometry());
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  g.add(
    new THREE.LineSegments(
      lineGeo,
      track(
        new THREE.LineBasicMaterial({
          color: "#4aa8ff",
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })
      )
    )
  );
  const all = layers.flat();
  const np = new Float32Array(all.length * 3);
  const nc = new Float32Array(all.length * 3);
  const col = new THREE.Color();
  const endColor = new THREE.Color("#ff7de0");
  let k = 0;
  layers.forEach((L, li) =>
    L.forEach((v) => {
      np.set([v.x, v.y, v.z], k * 3);
      col.set("#7fdcff").lerp(endColor, li / (sizes.length - 1));
      nc.set([col.r, col.g, col.b], k * 3);
      k++;
    })
  );
  const nodeGeo = track(new THREE.BufferGeometry());
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(np, 3));
  nodeGeo.setAttribute("color", new THREE.BufferAttribute(nc, 3));
  const glow = track(glowTexture());
  g.add(
    new THREE.Points(
      nodeGeo,
      track(
        new THREE.PointsMaterial({
          size: 0.3,
          map: glow,
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })
      )
    )
  );
  const PK = 80;
  const pkGeo = track(new THREE.BufferGeometry());
  const pkPos = new Float32Array(PK * 3);
  pkGeo.setAttribute("position", new THREE.BufferAttribute(pkPos, 3));
  g.add(
    new THREE.Points(
      pkGeo,
      track(
        new THREE.PointsMaterial({
          size: 0.12,
          map: glow,
          color: "#ffffff",
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })
      )
    )
  );
  const pulses = Array.from({ length: PK }, () => ({
    c: Math.floor(Math.random() * conns.length),
    t: Math.random(),
    v: 0.4 + Math.random() * 0.6,
  }));
  const glyphs = glyphField(track, 22);
  g.add(glyphs.group);
  g.rotation.z = 0.1;

  // ---- interaction: hover a node to light its connections; click or tap to fire a signal through the network ----
  const N = all.length;
  const baseCol = nc.slice();
  const flash = new Float32Array(N);
  const connsOf: number[][] = Array.from({ length: N }, () => []);
  connIdx.forEach(([a, b], c) => {
    connsOf[a].push(c);
    connsOf[b].push(c);
  });

  const addMat = (color: string, opacity: number, size?: number) =>
    size === undefined
      ? track(
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          })
        )
      : track(
          new THREE.PointsMaterial({
            size,
            map: glow,
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          })
        );

  const MAXH = 24;
  const hiPos = new Float32Array(MAXH * 6);
  const hiGeo = track(new THREE.BufferGeometry());
  hiGeo.setAttribute("position", new THREE.BufferAttribute(hiPos, 3));
  hiGeo.setDrawRange(0, 0);
  const hiLines = new THREE.LineSegments(hiGeo, addMat("#bfeaff", 0.95) as THREE.LineBasicMaterial);
  hiLines.frustumCulled = false;
  g.add(hiLines);

  const hoverGeo = track(new THREE.BufferGeometry());
  const hoverPos = new Float32Array(3);
  hoverGeo.setAttribute("position", new THREE.BufferAttribute(hoverPos, 3));
  const hoverPt = new THREE.Points(hoverGeo, addMat("#ffffff", 0.9, 0.6) as THREE.PointsMaterial);
  hoverPt.visible = false;
  hoverPt.frustumCulled = false;
  g.add(hoverPt);

  const CP = 300;
  const HOP = 0.3; // seconds per layer hop
  const cpGeo = track(new THREE.BufferGeometry());
  const cpPos = new Float32Array(CP * 3);
  for (let i = 0; i < CP; i++) cpPos[i * 3 + 1] = 1e4;
  cpGeo.setAttribute("position", new THREE.BufferAttribute(cpPos, 3));
  const cpPts = new THREE.Points(cpGeo, addMat("#ffd2f4", 1, 0.2) as THREE.PointsMaterial);
  cpPts.frustumCulled = false;
  g.add(cpPts);
  const cp = Array.from({ length: CP }, () => ({ on: false, a: 0, b: 0, t: 0 }));

  let hover = -1;
  let nearest = -1;
  let nearestD = 1e9;
  const tmp = new THREE.Vector3();
  const setHover = (h: number) => {
    if (h === hover) return;
    hover = h;
    if (h < 0) {
      hiGeo.setDrawRange(0, 0);
      hoverPt.visible = false;
      return;
    }
    let n = 0;
    for (const c of connsOf[h]) {
      const [a, b] = conns[c];
      hiPos.set([a.x, a.y, a.z, b.x, b.y, b.z], n * 6);
      n++;
    }
    hiGeo.attributes.position.needsUpdate = true;
    hiGeo.setDrawRange(0, n * 2);
    hoverPos.set([all[h].x, all[h].y, all[h].z]);
    hoverGeo.attributes.position.needsUpdate = true;
    hoverPt.visible = true;
  };

  const hoverFn = (px: number | null, py: number | null, camera: THREE.Camera, w: number, h: number) => {
    nearest = -1;
    nearestD = 1e9;
    if (px === null || py === null) {
      setHover(-1);
      return false;
    }
    g.updateWorldMatrix(true, false);
    for (let i = 0; i < N; i++) {
      tmp.copy(all[i]).applyMatrix4(g.matrixWorld).project(camera);
      if (tmp.z > 1) continue;
      const sx = (tmp.x * 0.5 + 0.5) * w;
      const sy = (-tmp.y * 0.5 + 0.5) * h;
      const d = Math.hypot(sx - px, sy - py);
      if (d < nearestD) {
        nearestD = d;
        nearest = i;
      }
    }
    setHover(nearest >= 0 && nearestD < (w > 900 ? 46 : 60) ? nearest : -1);
    return hover >= 0;
  };

  const activateFn = (animated: boolean) => {
    const n = hover >= 0 ? hover : nearestD < 110 ? nearest : -1;
    if (n < 0) return false;
    flash[n] = 1;
    if (!animated) return true;
    cp.forEach((p) => (p.on = false));
    const L = layerOf[n];
    let k = 0;
    connIdx.forEach(([a, b]) => {
      const la = layerOf[a];
      const lb = layerOf[b];
      let from = -1;
      let to = -1;
      let hops = 0;
      if ((la === L && a === n) || la > L) {
        from = a;
        to = b;
        hops = la - L; // forward through the network
      } else if ((lb === L && b === n) || lb < L) {
        from = b;
        to = a;
        hops = L - lb; // and backward, like backpropagation
      }
      if (from < 0 || k >= CP) return;
      const p = cp[k++];
      p.on = true;
      p.a = from;
      p.b = to;
      p.t = -hops * HOP;
    });
    return true;
  };

  const interactStep = (dt: number) => {
    for (let i = 0; i < CP; i++) {
      const p = cp[i];
      if (!p.on) {
        cpPos[i * 3 + 1] = 1e4;
        continue;
      }
      p.t += dt;
      if (p.t < 0) {
        cpPos[i * 3 + 1] = 1e4;
        continue;
      }
      const u = p.t / HOP;
      if (u >= 1) {
        p.on = false;
        flash[p.b] = 1; // the node lights up as the signal arrives
        cpPos[i * 3 + 1] = 1e4;
        continue;
      }
      const A = all[p.a];
      const B = all[p.b];
      cpPos.set([A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u, A.z + (B.z - A.z) * u], i * 3);
    }
    cpGeo.attributes.position.needsUpdate = true;

    if (hover >= 0) flash[hover] = Math.max(flash[hover], 0.7);
    const decay = Math.exp(-dt * 2.4);
    for (let i = 0; i < N; i++) {
      const f = Math.min(1, flash[i]);
      for (let c = 0; c < 3; c++) {
        const b = baseCol[i * 3 + c];
        nc[i * 3 + c] = b + (1 - b) * f;
      }
      const nf = flash[i] * decay;
      flash[i] = nf < 0.002 ? 0 : nf;
    }
    nodeGeo.attributes.color.needsUpdate = true;
  };

  return {
    object: g,
    interact: { hover: hoverFn, activate: activateFn },
    update: (_t, dt) => {
      g.rotation.y = Math.sin(_t * 0.25) * 0.7; // sway so the wide network stays broadside
      pulses.forEach((p, i) => {
        p.t += dt * p.v;
        if (p.t > 1) {
          p.c = Math.floor(Math.random() * conns.length);
          p.t = 0;
        }
        const [a, b] = conns[p.c];
        pkPos[i * 3] = a.x + (b.x - a.x) * p.t;
        pkPos[i * 3 + 1] = a.y + (b.y - a.y) * p.t;
        pkPos[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
      });
      pkGeo.attributes.position.needsUpdate = true;
      glyphs.update(dt);
      interactStep(dt);
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

export const createNeural = neural;
