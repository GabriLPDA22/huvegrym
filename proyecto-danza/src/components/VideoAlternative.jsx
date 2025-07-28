// components/VideoAlternative.jsx
import { useEffect, useRef } from 'react';

export function VideoAlternative({ type = 'hero' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Partículas de humo/polvo
    const particles = [];
    const particleCount = type === 'hero' ? 200 : 100;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = type === 'hero' ? '#d4af37' : '#ffffff';
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.opacity -= 0.001;
        this.size += 0.01;

        if (this.y < -50 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Efecto de luz dinámica
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animación principal
    function animate() {
      // Fondo con gradiente dinámico
      const gradient = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, 600
      );
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.02)');
      gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.01)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar partículas
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Líneas de energía (estilo Matrix/Tron)
      if (type === 'hero') {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(0, Math.random() * canvas.height);
          ctx.lineTo(canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        opacity: type === 'hero' ? 0.6 : 0.3,
        mixBlendMode: 'screen'
      }}
    />
  );
}

// Componente alternativo para el video hero
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Fondo base con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a1a1a] to-black">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)
            `,
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
      </div>

      {/* Efectos de partículas con Canvas */}
      <VideoAlternative type="hero" />

      {/* Imagen de fondo con efecto Ken Burns */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <img
          src="/images/Duo.webp"
          alt=""
          className="w-full h-full object-cover scale-110"
          style={{
            animation: 'kenBurns 30s ease-in-out infinite',
            filter: 'blur(8px) grayscale(100%) contrast(1.2)'
          }}
        />
      </div>

      {/* Overlay de líneas estilo retro */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(212, 175, 55, 0.1) 2px,
              rgba(212, 175, 55, 0.1) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(212, 175, 55, 0.1) 2px,
              rgba(212, 175, 55, 0.1) 4px
            )
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes kenBurns {
          0% {
            transform: scale(1.1) translateX(0);
          }
          50% {
            transform: scale(1.3) translateX(-5%);
          }
          100% {
            transform: scale(1.1) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
