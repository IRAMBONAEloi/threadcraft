import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function TeeViewer({ color = '#0E0C18', ink = '#8B6BFF', draggable = false }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const decalMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0x8B6BFF, 1.4, 20); rim.position.set(-3, -2, 3); scene.add(rim);
    const rim2 = new THREE.PointLight(0xFF6B4A, 0.9, 20); rim2.position.set(3, -3, 2); scene.add(rim2);

    const pts = [
      [-0.55,0.85],[-0.28,1.02],[0,0.92],[0.28,1.02],[0.55,0.85],
      [0.95,0.55],[0.74,0.24],[0.6,0.4],[0.6,-1.0],[-0.6,-1.0],
      [-0.6,0.4],[-0.74,0.24],[-0.95,0.55]
    ];
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16, bevelEnabled: true, bevelThickness: 0.03,
      bevelSize: 0.025, bevelSegments: 3, curveSegments: 8,
    });
    geo.center();
    
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.55, metalness: 0.1 });
    materialRef.current = mat;
    
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, mat));
    group.rotation.y = 0.5;
    scene.add(group);

    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    if (ctx) {
      const grd = ctx.createRadialGradient(128, 128, 10, 128, 128, 110);
      grd.addColorStop(0, ink);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(128, 128, 105, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(128, 128, 95, 0, Math.PI * 2); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    const decalGeo = new THREE.PlaneGeometry(1, 1);
    const decalMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    decalMaterialRef.current = decalMat;
    
    const decal = new THREE.Mesh(decalGeo, decalMat);
    decal.position.set(0, 0.1, 0.12);
    group.add(decal);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      renderer.domElement.style.display = 'block';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Drag logic
    let dragging = false;
    let lastX = 0;
    let velocity = 0.005;
    const canvas = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (!draggable) return;
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggable || !dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      group.rotation.y += dx * 0.01;
      velocity = dx * 0.0025;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!draggable) return;
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    if (draggable) {
      canvas.style.touchAction = 'none';
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
    }

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      
      if (!dragging) {
        group.rotation.y += velocity;
        velocity *= 0.965;
        // If velocity is very small, reset to a gentle auto-rotate speed
        if (Math.abs(velocity) < 0.001) {
          velocity = 0.005;
        }
      }
      
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (draggable) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
      }
      geo.dispose(); mat.dispose(); decalGeo.dispose(); decalMat.dispose(); tex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- Only run once on mount

  // Update the colors when props change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(new THREE.Color(color));
    }
    
    if (decalMaterialRef.current) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        const grd = ctx.createRadialGradient(128, 128, 10, 128, 128, 110);
        grd.addColorStop(0, ink);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(128, 128, 105, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(128, 128, 95, 0, Math.PI * 2); ctx.stroke();
      }
      const newTex = new THREE.CanvasTexture(c);
      decalMaterialRef.current.map?.dispose();
      decalMaterialRef.current.map = newTex;
      decalMaterialRef.current.needsUpdate = true;
    }
  }, [color, ink]);

  return <div ref={containerRef} className="w-full h-full" />;
}

export default TeeViewer;