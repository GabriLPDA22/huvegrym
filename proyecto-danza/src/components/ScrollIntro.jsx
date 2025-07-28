import { useRef, useLayoutEffect, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create("cinematic", "M0,0 C0.084,0.61 0.214,0.802 0.28,0.856 0.346,0.91 0.418,0.944 0.5,0.944 0.582,0.944 0.654,0.91 0.72,0.856 0.786,0.802 0.916,0.61 1,0");

export function ScrollIntro() {
  const componentRef = useRef(null);
  const videoRef = useRef(null);
  const smokeRef = useRef(null);
  const vegaRef = useRef(null);
  const hugoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const overlayRef = useRef(null);
  const particlesRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!smokeRef.current || !particlesRef.current || smokeRef.current.childElementCount > 0) return;

    const smokeContainer = smokeRef.current;
    const particlesContainer = particlesRef.current;

    for (let i = 0; i < 15; i++) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-particle';
      smoke.style.left = `${Math.random() * 100}%`;
      smoke.style.bottom = `${Math.random() * 20 - 10}%`;
      smoke.style.animationDelay = `${Math.random() * 10}s`;
      smoke.style.animationDuration = `${15 + Math.random() * 10}s`;
      smokeContainer.appendChild(smoke);
    }

    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div');
      particle.className = 'dust-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${20 + Math.random() * 30}s`;
      particlesContainer.appendChild(particle);
    }
  }, []);

  useLayoutEffect(() => {
    if (!componentRef.current) return;

    const ctx = gsap.context(() => {
      const loadingTl = gsap.timeline({
        onComplete: () => {
          gsap.set('.loading-screen', { display: 'none' });
        }
      });

      loadingTl
        .set('.loading-text span', { yPercent: 100 })
        .to('.loading-text span', { yPercent: 0, duration: 0.8, stagger: 0.05, ease: 'power4.out' })
        .to(progressRef.current, { width: '100%', duration: 2.5, ease: 'power2.inOut' }, 0.5)
        .to('.loading-screen', { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', duration: 1.5, ease: 'power4.inOut' })
        .from([titleRef.current, subtitleRef.current], { y: 150, opacity: 0, duration: 2, stagger: 0.3, ease: 'cinematic' }, '-=1');

      gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          start: 'top top',
          end: '+=8000',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: self => {
            const progress = self.progress;
            if (!videoRef.current) return;
            const scale = 1.25 + progress * 0.25;
            const blur = progress < 0.5 ? 0 : (progress - 0.5) * 10;
            const contrast = 1.3 + progress * 0.5;
            const brightness = 0.4 - progress * 0.2;
            const img = videoRef.current.querySelector('img');
            if(img) {
              img.style.transform = `scale(${scale})`;
              img.style.filter = `grayscale(100%) blur(${blur}px) contrast(${contrast}) brightness(${brightness})`;
            }
          }
        }
      })
      .to(titleRef.current, { scale: 0.8, opacity: 0.3, duration: 2, ease: 'power2.inOut' })
      .to(subtitleRef.current, { y: -50, opacity: 0, duration: 1.5, ease: 'power2.in' }, '<0.5')
      .fromTo(vegaRef.current, { xPercent: -150, scale: 1.5, opacity: 0, filter: 'blur(20px)' }, { xPercent: -30, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 3, ease: 'cinematic' }, 1)
      .to(vegaRef.current, { rotationY: 15, z: 100, duration: 2, ease: 'power2.inOut' }, '<1')
      .fromTo(hugoRef.current, { xPercent: 150, scale: 1.5, opacity: 0, filter: 'blur(20px)' }, { xPercent: 30, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 3, ease: 'cinematic' }, 2)
      .to(hugoRef.current, { rotationY: -15, z: 100, duration: 2, ease: 'power2.inOut' }, '<1')
      .to([vegaRef.current, hugoRef.current], { xPercent: 0, rotationY: 0, scale: 1.2, duration: 3, ease: 'power3.inOut' }, 4)
      .to(titleRef.current, { scale: 2, opacity: 0, y: -200, duration: 2, ease: 'power2.in' }, '<')
      .to(overlayRef.current, { opacity: 1, duration: 2, ease: 'power2.in' }, 6)
      .to([vegaRef.current, hugoRef.current], { scale: 0.5, opacity: 0, filter: 'blur(20px)', duration: 2, ease: 'power3.in' }, '<0.5')
      .to(componentRef.current, { scale: 1.1, duration: 2, ease: 'power3.in' }, '<');

    }, componentRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (ref) => {
    gsap.to(ref.current, { scale: 1.1, z: 150, duration: 0.6, ease: 'power2.out' });
  };
  const handleMouseLeave = (ref) => {
    gsap.to(ref.current, { scale: 1, z: 100, duration: 0.6, ease: 'power2.out' });
  };

  return (
    <>
      <div className="loading-screen fixed inset-0 bg-black z-[100] flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="w-full max-w-2xl px-8">
          <div className="loading-text overflow-hidden mb-12">
            <h2 className="text-4xl md:text-6xl font-serif text-white/80 tracking-[0.2em] uppercase flex justify-center">
              {'LOADING'.split('').map((char, i) => (<span key={i} className="inline-block">{char}</span>))}
            </h2>
          </div>
          <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
            <div ref={progressRef} className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d4af37] via-white to-[#d4af37] h-full w-0"></div>
          </div>
          <div className="text-center mt-8">
            <p className="text-white/30 text-sm tracking-[0.3em] uppercase">Preparando experiencia inmersiva</p>
          </div>
        </div>
      </div>

      {/* El resto del JSX sigue aquí... */}
      <div ref={componentRef} className="h-screen w-full relative overflow-hidden bg-black">
        <div ref={smokeRef} className="smoke-container absolute inset-0 z-[5]"></div>
        <div ref={particlesRef} className="absolute inset-0 z-[8]"></div>
        <div className="absolute inset-0 z-[1]">
          <div ref={videoRef} className="absolute inset-0 overflow-hidden">
            <img src="/images/Duo.webp" alt="" className="w-full h-full object-cover scale-125" style={{ animation: 'slowZoom 20s ease-in-out infinite alternate', filter: 'grayscale(100%) contrast(1.3) brightness(0.4)' }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 50%)', animation: 'lightRotate 30s linear infinite' }} />
          </div>
        </div>
        <div ref={overlayRef} className="absolute inset-0 z-[90] opacity-0 bg-black"></div>
        <div className="relative z-[50] h-full flex items-center justify-center">
          <div ref={vegaRef} onMouseEnter={() => handleMouseEnter(vegaRef)} onMouseLeave={() => handleMouseLeave(vegaRef)} className="absolute left-0 w-1/2 h-full flex items-center justify-center opacity-0 transform-gpu" style={{ perspective: '1000px' }}>
            <div className="relative w-[80%] max-w-[500px]">
              <img src="/images/Vega.jpg" alt="Vega" className="w-full h-auto rounded-2xl shadow-2xl" style={{ filter: 'contrast(1.2) brightness(0.9)', boxShadow: '0 0 100px rgba(212, 175, 55, 0.3)' }} />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-full border border-[#d4af37]/50">
                <h3 className="font-serif text-3xl text-[#d4af37] tracking-widest">VEGA</h3>
              </div>
            </div>
          </div>
          <div ref={hugoRef} onMouseEnter={() => handleMouseEnter(hugoRef)} onMouseLeave={() => handleMouseLeave(hugoRef)} className="absolute right-0 w-1/2 h-full flex items-center justify-center opacity-0 transform-gpu" style={{ perspective: '1000px' }}>
            <div className="relative w-[80%] max-w-[500px]">
              <img src="/images/Hugo.jpg" alt="Hugo" className="w-full h-auto rounded-2xl shadow-2xl" style={{ filter: 'contrast(1.2) brightness(0.9)', boxShadow: '0 0 100px rgba(212, 175, 55, 0.3)' }} />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-full border border-[#d4af37]/50">
                <h3 className="font-serif text-3xl text-[#d4af37] tracking-widest">HUGO</h3>
              </div>
            </div>
          </div>
          <div className="text-center px-6 z-[60]">
            <h1 ref={titleRef} className="font-serif text-[clamp(5rem,18vw,15rem)] leading-[0.7] text-center mb-8" style={{ textShadow: '0 0 80px rgba(212, 175, 55, 0.5)' }}>
              <span className="block text-outline-gold glow-text">VEGA</span>
              <span className="block text-white/80 text-[0.3em] my-4">&</span>
              <span className="block text-outline glow-text">HUGO</span>
            </h1>
            <div ref={subtitleRef} className="space-y-2">
              <p className="text-[#d4af37] text-sm md:text-lg tracking-[0.5em] uppercase font-light">Donde el movimiento</p>
              <p className="text-white text-xl md:text-3xl tracking-[0.3em] uppercase font-medium">Trasciende el espacio</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[70]">
          <div className="flex flex-col items-center space-y-4 animate-pulse">
            <div className="text-white/50 text-xs tracking-[0.3em] uppercase">Scroll para continuar</div>
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent"></div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-[15vh] bg-gradient-to-b from-black via-black/80 to-transparent z-[80]"></div>
        <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-black via-black/80 to-transparent z-[80]"></div>
      </div>
    </>
  );
}
