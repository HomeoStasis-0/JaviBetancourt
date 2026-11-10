"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createNeural, type Shape } from "@/app/lib/shapes";
import { SLIDES, NAV_GROUPS } from "@/app/data/slides";
import "./cinematic.css";

const N = SLIDES.length;
const CENTERS = SLIDES.map((_, i) => i / (N - 1));
const HALF_WINDOW = 0.46 / (N - 1);

// Which layout variant each slide uses, and which side of the screen its text sits on.
const VARIANTS = (() => {
  let p = 0;
  return SLIDES.map((s, i) =>
    s.group === "projects" ? `p${p++ % 2}` : s.group === "intro" ? "intro" : `v${i % 3}`
  );
})();
// +1 = text on the left, so the 3D shape moves right (and the reverse).
const SIDE: Record<string, number> = { intro: 1, v0: 1, v1: 1, v2: 1, p0: 1, p1: 1 };

function SplitTitle({ lines, small }: { lines: string[]; small?: boolean }) {
  let n = 0;
  return (
    <h2 className={`cin-title${small ? " small" : ""}`}>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split("").map((ch, i) =>
            ch === " " ? (
              " "
            ) : (
              <span key={i} className="char" style={{ transitionDelay: `${n++ * 0.035}s` }}>
                {ch}
              </span>
            )
          )}
        </span>
      ))}
    </h2>
  );
}

const VERT = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const FRAG = `
varying vec2 vUv;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse; uniform float uScroll;
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  float aspect = uResolution.x / uResolution.y;
  float time = uTime * 0.08;
  float scroll = uScroll;
  float angle1 = 0.6, angle2 = -0.7, angle3 = 1.2;
  float freq1 = 2.4, freq2 = 3.2, freq3 = 4.0;
  vec2 warpedUv = uv;
  float scrollDeform = scroll * 5.0;
  warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
  warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;
  warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
  warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;
  warpedUv += vec2(scroll * 0.04, -scroll * 0.02) + vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);
  vec2 dir1 = vec2(cos(angle1), sin(angle1));
  vec2 dir2 = vec2(cos(angle2), sin(angle2));
  vec2 dir3 = vec2(cos(angle3), sin(angle3));
  float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
  float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
  float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);
  float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;
  float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
  float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
  float crest = wideSheen * 0.5 + crispSpecular * 0.9;
  vec3 c0_shadow = vec3(0.0006, 0.0008, 0.0022);
  vec3 c0_wave1 = vec3(0.022, 0.030, 0.095);
  vec3 c0_wave2 = vec3(0.010, 0.014, 0.055);
  vec3 c0_crest = vec3(0.20, 0.24, 0.62);
  vec3 c1_shadow = vec3(0.0004, 0.0006, 0.0012);
  vec3 c1_wave1 = vec3(0.015, 0.035, 0.065);
  vec3 c1_wave2 = vec3(0.008, 0.020, 0.045);
  vec3 c1_crest = vec3(0.18, 0.35, 0.55);
  float t = smoothstep(0.0, 1.0, scroll);
  vec3 colShadow = mix(c0_shadow, c1_shadow, t);
  vec3 colWave1 = mix(c0_wave1, c1_wave1, t);
  vec3 colWave2 = mix(c0_wave2, c1_wave2, t);
  vec3 colCrest = mix(c0_crest, c1_crest, t);
  vec3 color = colShadow;
  color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
  color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));
  color += colCrest * crest * 1.4;
  color *= 1.0 - dot(uv, uv) * 0.12;
  gl_FragColor = vec4(color, 1.0);
}`;

function GridLine({ children }: { children?: React.ReactNode }) {
  return (
    <div className="cin-line">
      <div className="cin-gdot" />
      <div className="cin-gdot" />
      {children}
    </div>
  );
}

export default function Cinematic() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    document.body.classList.add("cinematic");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sizes = { w: window.innerWidth, h: window.innerHeight };
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.FogExp2("#000000", 0.01);
    const camera = new THREE.PerspectiveCamera(50, sizes.w / sizes.h, 0.1, 100);
    camera.position.set(0, 0.2, 3.0);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(sizes.w, sizes.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2;

    // liquid wave backdrop, glued to the camera
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(sizes.w, sizes.h) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
    };
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthWrite: false, depthTest: false })
    );
    bg.position.set(0, 0, -8);
    bg.renderOrder = -10;
    camera.add(bg);

    // centerpiece holder
    const pivot = new THREE.Group();
    pivot.position.y = -0.2;
    pivot.scale.setScalar(0.72);
    scene.add(pivot);
    // the neural network centerpiece
    const current: Shape = createNeural();
    pivot.add(current.object);

    // star particles: tiny, ice-white, spread through the whole scene
    const STAR_COUNT = 1100;
    const SPAN = 7;
    const sp = new Float32Array(STAR_COUNT * 3);
    const sc = new Float32Array(STAR_COUNT * 3);
    const sv: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      sp[i * 3] = (Math.random() * 2 - 1) * SPAN;
      sp[i * 3 + 1] = (Math.random() * 2 - 1) * SPAN * 0.7;
      sp[i * 3 + 2] = (Math.random() * 2 - 1) * SPAN;
      const r = Math.random();
      if (r < 0.72) sc.set([0.85, 0.92, 1], i * 3);
      else if (r < 0.92) sc.set([0.55, 0.72, 1], i * 3);
      else sc.set([1, 0.82, 0.62], i * 3);
      sv.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      });
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(sc, 3));
    const tc = document.createElement("canvas");
    tc.width = tc.height = 16;
    const tctx = tc.getContext("2d")!;
    const tg = tctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    tg.addColorStop(0, "rgba(255,255,255,1)");
    tg.addColorStop(0.3, "rgba(255,255,255,0.8)");
    tg.addColorStop(1, "rgba(0,0,0,0)");
    tctx.fillStyle = tg;
    tctx.fillRect(0, 0, 16, 16);
    const starTex = new THREE.CanvasTexture(tc);
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: starTex,
      })
    );
    scene.add(stars);

    // DOM refs
    const slideEls = SLIDES.map((s) => root.querySelector<HTMLElement>(`[data-slide-id="${s.id}"]`));
    const fills = SLIDES.map((_, i) => root.querySelector<HTMLElement>(`#cin-fill-${i}`));
    const gdots = Array.from(root.querySelectorAll<HTMLElement>(".cin-gdot"));

    let currentScroll = 0;
    let shiftX = 0, shiftY = 0;
    let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;
    let cx = sizes.w / 2, cy = sizes.h / 2, ox = cx, oy = cy;
    const clock = new THREE.Clock();

    const onMove = (e: MouseEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      if (innerRef.current) {
        innerRef.current.style.left = `${cx}px`;
        innerRef.current.style.top = `${cy}px`;
      }
      tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      tMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onResize = () => {
      sizes.w = window.innerWidth;
      sizes.h = window.innerHeight;
      camera.aspect = sizes.w / sizes.h;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.w, sizes.h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniforms.uResolution.value.set(sizes.w, sizes.h);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-goto]"));
    const clicks = links.map((a) => {
      const fn = (e: Event) => {
        e.preventDefault();
        const idx = Number(a.dataset.goto);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: max * CENTERS[idx], behavior: reduce ? "auto" : "smooth" });
      };
      a.addEventListener("click", fn);
      return fn;
    });

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? window.scrollY / max : 0;
      currentScroll += (target - currentScroll) * (reduce ? 1 : 0.025);
      mouseX += (tMouseX - mouseX) * 0.05;
      mouseY += (tMouseY - mouseY) * 0.05;
      ox += (cx - ox) * 0.2;
      oy += (cy - oy) * 0.2;
      if (outerRef.current) {
        outerRef.current.style.left = `${ox}px`;
        outerRef.current.style.top = `${oy}px`;
      }

      const time = clock.getElapsedTime();
      pivot.rotation.y = mouseX * 0.25;
      pivot.rotation.x = mouseY * 0.15;
      if (!reduce) current.update(time, dt);

      // stars drift, and swirl faster while scrolling
      const vel = Math.abs(target - currentScroll);
      const speedMul = reduce ? 0 : 1 + vel * 40;
      const p = starGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < STAR_COUNT; i++) {
        const k = i * 3;
        const d = sv[i];
        p[k] += d.x * dt * speedMul;
        p[k + 1] += d.y * dt * speedMul;
        p[k + 2] += d.z * dt * speedMul;
        if (p[k] > SPAN) p[k] = -SPAN;
        else if (p[k] < -SPAN) p[k] = SPAN;
        if (p[k + 1] > SPAN * 0.7) p[k + 1] = -SPAN * 0.7;
        else if (p[k + 1] < -SPAN * 0.7) p[k + 1] = SPAN * 0.7;
        if (p[k + 2] > SPAN) p[k + 2] = -SPAN;
        else if (p[k + 2] < -SPAN) p[k + 2] = SPAN;
      }
      starGeo.attributes.position.needsUpdate = true;

      // camera orbit
      const phi = currentScroll * Math.PI * 2;
      const y = 0.35 + Math.sin(currentScroll * Math.PI) * 0.8;
      const radius = 4.2 - Math.sin(currentScroll * Math.PI) * 0.6;
      camera.position.lerp(new THREE.Vector3(radius * Math.sin(phi), y, radius * Math.cos(phi)), 0.025);
      camera.lookAt(new THREE.Vector3(0, -0.15, 0));

      // Slide the rendered image (in screen space, so it holds while orbiting) away from the text.
      const idx = Math.max(0, Math.min(N - 1, Math.round(currentScroll * (N - 1))));
      const wide = sizes.w > 900;
      const tX = wide ? (SIDE[VARIANTS[idx]] ?? 0) * 0.2 * sizes.w : 0;
      const tY = wide ? 0 : -0.16 * sizes.h;
      shiftX += (tX - shiftX) * 0.04;
      shiftY += (tY - shiftY) * 0.04;
      camera.setViewOffset(sizes.w, sizes.h, -shiftX, -shiftY, sizes.w, sizes.h);

      uniforms.uTime.value = time;
      uniforms.uMouse.value.set(mouseX, -mouseY);
      uniforms.uScroll.value = currentScroll;

      // slides + stories progress
      fills.forEach((f, i) => {
        if (!f) return;
        const pr = Math.max(0, Math.min(1, currentScroll * N - i));
        f.style.height = `${pr * 100}%`;
      });
      for (let i = 0; i < N; i++) {
        const on = Math.abs(currentScroll - CENTERS[i]) <= HALF_WINDOW;
        slideEls[i]?.classList.toggle("active", on);
      }

      gdots.forEach((dot, i) => {
        let speed = 90 + ((i * 55) % 180);
        if (i % 2 === 0) speed = -speed;
        let yy = ((i * 17) % 80) + 10 + currentScroll * speed;
        yy = ((yy % 100) + 100) % 100;
        dot.style.top = `${yy}%`;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      links.forEach((a, i) => a.removeEventListener("click", clicks[i]));
      document.body.classList.remove("cinematic");
      current.dispose();
      starGeo.dispose();
      starTex.dispose();
      renderer.dispose();
    };
  }, []);

  const navTargets = NAV_GROUPS.map((g) => ({
    ...g,
    index: SLIDES.findIndex((s) => s.group === g.group),
  }));

  return (
    <div ref={rootRef} style={{ height: `${N * 100}vh` }}>
      <div ref={innerRef} className="cin-cursor-inner" />
      <div ref={outerRef} className="cin-cursor-outer" />

      <div className="cin-container">
        <div className="cin-header">
          <a href={`#${SLIDES[0].id}`} data-goto={0} className="cin-brand">Javier Betancourt</a>
          <nav className="cin-nav">
            {navTargets.map((t, i) => (
              <span key={t.group} className="cin-navitem">
                {i > 0 && <span className="cin-dot" />}
                <a href={`#${SLIDES[t.index].id}`} data-goto={t.index}>{t.label}</a>
              </span>
            ))}
          </nav>
          <a href="/JaviBetancourtResume.pdf" target="_blank" rel="noopener noreferrer" className="cin-btn">
            Resume <i />
          </a>
        </div>

        {SLIDES.map((s, i) => {
          const variant = VARIANTS[i];
          return (
            <div key={s.id} className={`cin-slide ${variant}`} id={`cin-${s.id}`} data-slide-id={s.id}>
              {s.image && (
                <div className="cin-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.title.join(" ")} />
                </div>
              )}
              <SplitTitle lines={s.title} small={s.small} />
              {s.group === "intro" ? (
                s.paras.length > 0 && (
                <div className="cin-row">
                  <p className="cin-desc col-1">{s.paras[0]}</p>
                  <p className="cin-desc col-2">{s.paras[1]}</p>
                </div>
                )
              ) : (
                <div className="cin-body">
                  {s.paras.map((p, pi) => (
                    <p key={pi} className="cin-desc" style={{ transitionDelay: `${0.4 + pi * 0.12}s` }}>{p}</p>
                  ))}
                  {s.tags && (
                    <div className="cin-tags cin-desc" style={{ transitionDelay: "0.55s" }}>
                      {s.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                  {s.links && (
                    <div className="cin-links cin-desc" style={{ transitionDelay: "0.7s" }}>
                      {s.links.map((l) =>
                        l.external || l.download ? (
                          <a
                            key={l.label}
                            href={l.href}
                            {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            {...(l.download ? { download: true } : {})}
                          >
                            {l.label} <span aria-hidden="true">{"↗"}</span>
                          </a>
                        ) : (
                          <Link key={l.label} href={l.href}>
                            {l.label} <span aria-hidden="true">{"↗"}</span>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>

      <div className="cin-hline" />
      <div className="cin-lines">
        <GridLine /><GridLine /><GridLine /><GridLine />
        <GridLine>
          <div className="cin-dashes">
            {SLIDES.map((s, i) => (
              <div className="cin-dash" key={s.id}><b id={`cin-fill-${i}`} /></div>
            ))}
          </div>
        </GridLine>
      </div>
      <canvas ref={canvasRef} className="cin-webgl" />
      <div className="cin-shade" aria-hidden="true" />
    </div>
  );
}
