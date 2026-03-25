import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize scroll-driven deconstruction of the PCB board.
 *
 * Maps normalized scroll progress (0 → 1) of the whole page to
 * the conceptual hardware layers:
 *
 * 0.00–0.14 → casing
 * 0.15–0.29 → thermal
 * 0.30–0.44 → pcb
 * 0.45–0.59 → traces
 * 0.60–0.74 → components
 * 0.75–0.89 → die
 * 0.90–1.00 → quantum
 *
 * Crossing a region boundary triggers a brief glitch flash.
 *
 * @param {(layer: string) => void} setLayer
 * @param {(active: boolean) => void} setGlitch
 * @returns {() => void} cleanup function
 */
export function initScroll(setLayer, setGlitch) {
  const LAYERS = [
    { name: 'casing', from: 0.0, to: 0.02 },
    { name: 'thermal', from: 0.02, to: 0.03 },
    { name: 'pcb', from: 0.03, to: 0.04 },
    { name: 'traces', from: 0.04, to: 0.07 },
    { name: 'components', from: 0.07, to: 0.12 },
    { name: 'die', from: 0.12, to: 0.15 },
    { name: 'quantum', from: 0.15, to: 1.01 },
  ];

  let currentLayer = 'casing';
  let glitchTimeout = null;

  const findLayer = (progress) =>
    LAYERS.find((l) => progress >= l.from && progress < l.to) || LAYERS[0];

  const triggerGlitch = () => {
    if (glitchTimeout) {
      clearTimeout(glitchTimeout);
    }
    setGlitch(true);
    glitchTimeout = setTimeout(() => {
      setGlitch(false);
    }, 300);
  };

  const st = ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.5,
    onUpdate: (self) => {
      const progress = self.progress; // 0 → 1
      const { name } = findLayer(progress);
      if (name !== currentLayer) {
        currentLayer = name;
        setLayer(name);
        triggerGlitch();
      }
    },
  });

  // Initialize with current scroll position
  const initialProgress = ScrollTrigger.maxScroll(window) === 0
    ? 0
    : window.scrollY / ScrollTrigger.maxScroll(window);
  const { name } = findLayer(initialProgress);
  currentLayer = name;
  setLayer(name);

  return () => {
    st.kill();
    if (glitchTimeout) {
      clearTimeout(glitchTimeout);
    }
  };
}

