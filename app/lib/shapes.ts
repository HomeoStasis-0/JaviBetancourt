import * as THREE from "three";

export type Shape = {
  object: THREE.Object3D;
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
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) {
      for (const b of layers[l + 1]) {
        lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
        conns.push([a, b]);
      }
    }
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

  return {
    object: g,
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
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

export const createNeural = neural;
