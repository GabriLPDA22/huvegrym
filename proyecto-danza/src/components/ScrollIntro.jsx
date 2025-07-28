import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollIntro() {
  const componentRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          start: 'top top',
          end: '+=2000',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(imageRef.current, { scale: 1.8 }, 0);
      tl.to(titleRef.current, { opacity: 0, y: -50 }, 0);
      tl.to(imageRef.current, { opacity: 0 }, 0.7);
      tl.from(contentRef.current, { y: 100, opacity: 0 }, 1);

    }, componentRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={componentRef}>
      <div className="relative h-screen w-full">
        <h1 ref={titleRef} className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-5xl md:text-7xl text-text-main">
          Nombre Dúo
        </h1>
        <div ref={imageRef} className="h-full w-full">
          <img
            src="/images/dancer-photo.jpg"
            alt="Dúo de bailarines en una pose artística"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      
      <div ref={contentRef} className="relative z-10 bg-background-main h-screen flex items-center justify-center">
        <div className="text-center">
            <h2 className="font-serif text-4xl text-text-main">Sobre Nosotros</h2>
            <p className="mt-4 text-accent-primary">Aquí comienza el contenido principal de la web.</p>
        </div>
      </div>
    </div>
  );
}
