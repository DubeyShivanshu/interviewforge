import { useEffect, useRef } from "react";

// Deterministic random so the facets look identical on every load
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Icosahedron subdivided once (80 faces), with jittered radii for a faceted look
const buildSphere = () => {
    const t = (1 + Math.sqrt(5)) / 2;
    const norm = ([x, y, z]) => {
        const l = Math.hypot(x, y, z);
        return [x / l, y / l, z / l];
    };

    let verts = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(norm);

    const base = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    const cache = {};
    const mid = (a, b) => {
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        if (cache[key] !== undefined) return cache[key];
        verts.push(norm([
            (verts[a][0] + verts[b][0]) / 2,
            (verts[a][1] + verts[b][1]) / 2,
            (verts[a][2] + verts[b][2]) / 2,
        ]));
        return (cache[key] = verts.length - 1);
    };

    const faces = [];
    base.forEach(([a, b, c]) => {
        const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
        faces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    });

    const rand = seeded(7);
    verts = verts.map(([x, y, z]) => {
        const r = 0.9 + rand() * 0.16;
        return [x * r, y * r, z * r];
    });

    return { verts, faces };
};

const LIGHT = (() => {
    const l = [-0.5, -0.6, 0.62];
    const m = Math.hypot(...l);
    return l.map((v) => v / m);
})();

const SphereBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { verts, faces } = buildSphere();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let w = 0, h = 0, raf = 0;
        let rotY = 0.4;
        const mouse = { x: 0, y: 0 };
        const eased = { x: 0, y: 0 };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (reduceMotion) draw();
        };

        const onMove = (e) => {
            mouse.x = e.clientX / w - 0.5;
            mouse.y = e.clientY / h - 0.5;
        };

        function draw() {
            ctx.clearRect(0, 0, w, h);

            // ease toward the cursor so the sphere leans slightly with the mouse
            eased.x += (mouse.x - eased.x) * 0.08;
            eased.y += (mouse.y - eased.y) * 0.08;
            if (!reduceMotion) rotY += 0.0044;   // doubled because we draw at ~30fps now

            const ay = rotY + eased.x * 0.6;
            const ax = 0.28 + eased.y * 0.4;
            const cy = Math.cos(ay), sy = Math.sin(ay);
            const cx = Math.cos(ax), sx = Math.sin(ax);

            const R = Math.min(w, h) * 0.44;
            const px = w / 2, py = h / 2, persp = 3.2;

            const pts = verts.map(([x, y, z]) => {
                const x1 = x * cy + z * sy;
                const z1 = -x * sy + z * cy;
                const y1 = y * cx - z1 * sx;
                const z2 = y * sx + z1 * cx;
                const s = persp / (persp - z2);
                return { x: px + x1 * R * s, y: py + y1 * R * s, X: x1, Y: y1, Z: z2 };
            });

            const order = faces
                .map((f, i) => ({ f, i, z: (pts[f[0]].Z + pts[f[1]].Z + pts[f[2]].Z) / 3 }))
                .sort((a, b) => a.z - b.z);

            order.forEach(({ f, i, z }) => {
                const [a, b, c] = f.map((k) => pts[k]);
                const front = z > 0;

                // face brightness from its direction relative to the light
                const nx = a.X + b.X + c.X, ny = a.Y + b.Y + c.Y, nz = a.Z + b.Z + c.Z;
                const nl = Math.hypot(nx, ny, nz) || 1;
                const lit = Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / nl);

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.lineTo(c.x, c.y);
                ctx.closePath();

                // every ninth face catches a rust tint
                ctx.fillStyle =
                    i % 9 === 0 && front
                        ? `rgba(194,81,58,${0.05 + lit * 0.14})`
                        : `rgba(255,255,255,${front ? lit * 0.035 : 0.008})`;
                ctx.fill();

                ctx.strokeStyle = front ? "rgba(217,211,201,0.10)" : "rgba(217,211,201,0.035)";
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            pts.forEach((p, i) => {
                if (p.Z > 0 && i % 3 === 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(217,211,201,0.35)";
                    ctx.fill();
                }
            });
        }

        // Draw at ~30fps, and skip frames while the page is scrolling
        // so the browser can spend its time on smooth scrolling.
        let last = 0;
        let scrolling = false;
        let scrollTimer = 0;

        const onScroll = () => {
            scrolling = true;
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => { scrolling = false; }, 150);
        };

        const loop = (now = 0) => {
            raf = requestAnimationFrame(loop);
            if (scrolling || now - last < 33) return;
            last = now;
            draw();
        };

        const onVisibility = () => {
            cancelAnimationFrame(raf);
            if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(loop);
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        if (!reduceMotion) raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(scrollTimer);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    return <canvas ref={canvasRef} className="sphere-bg" aria-hidden="true" />;
};

export default SphereBackground;