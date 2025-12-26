import "./IntroScreen.css";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function IntroScreen({ onFinish }) {
  const [particles, setParticles] = useState([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 30, damping: 25 });

  const bgX = useTransform(smoothMouseX, [0, window.innerWidth], [-15, 15]);
  const bgY = useTransform(smoothMouseY, [0, window.innerHeight], [-15, 15]);
  
  const glowX = useTransform(smoothMouseX, [0, window.innerWidth], [-25, 25]);
  const glowY = useTransform(smoothMouseY, [0, window.innerHeight], [-25, 25]);

  const cursorX = useTransform(smoothMouseX, v => v - 12);
  const cursorY = useTransform(smoothMouseY, v => v - 12);

  // Gentle 3D transforms
  const rotateX = useTransform(smoothMouseY, [0, window.innerHeight], [8, -8]);
  const rotateY = useTransform(smoothMouseX, [0, window.innerWidth], [-8, 8]);
  const contentZ = useTransform(smoothMouseX, [0, window.innerWidth], [0, 15]);

  useEffect(() => {
    // Fewer particles for eye comfort
    const particleArray = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 12}s`,
      animationDuration: `${10 + Math.random() * 6}s`,
      drift: `${(Math.random() - 0.5) * 150}px`
    }));
    setParticles(particleArray);

    const timer = setTimeout(onFinish, 6500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <motion.div
      className="intro-wrapper"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
    >
      {/* Soft Animated Background */}
      <motion.div 
        className="intro-bg" 
        style={{ x: bgX, y: bgY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      
      {/* Subtle Grid Overlay */}
      <div className="grid-overlay" />
      
      {/* Gentle Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>
      
      {/* Central Glow */}
      <motion.div 
        className="intro-glow" 
        style={{ x: glowX, y: glowY }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />

      {/* Floating Particles */}
      <div className="intro-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
              '--drift': particle.drift
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="intro-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Animated Logo Icon */}
        <motion.div
          className="intro-divine-logo"
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ 
            duration: 2, 
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.5 
          }}
        >
          <div className="logo-ring" />
          <div className="logo-ring" />
          <div className="logo-ring" />
          <motion.div 
            className="logo-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 1, 
              delay: 1.2, 
              type: "spring", 
              stiffness: 150,
              damping: 12
            }}
          >
            ✦
          </motion.div>
        </motion.div>

        {/* Logo Text Container */}
        <motion.div
          className="intro-logo-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
          style={{
            translateZ: contentZ,
            transformStyle: "preserve-3d"
          }}
        >
          <motion.h1
            className="intro-logo"
            initial={{ letterSpacing: "0.8em", opacity: 0 }}
            animate={{ letterSpacing: "0.35em", opacity: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {"DIVINE SKY".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 1.2 + i * 0.08, 
                  duration: 0.8,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                whileHover={{
                  scale: 1.15,
                  y: -8,
                  filter: "brightness(1.3)",
                  transition: { duration: 0.3, type: "spring", stiffness: 200 }
                }}
                style={{ 
                  display: 'inline-block',
                  transformStyle: "preserve-3d",
                  cursor: 'pointer'
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
            <div className="intro-shine" />
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="intro-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.88, y: 0 }}
          transition={{ delay: 2.8, duration: 2.2, ease: "easeOut" }}
          style={{
            translateZ: useTransform(contentZ, [0, 15], [0, 8])
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.5 }}
          >
            Crafting sacred altars and divine spaces worldwide
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Custom Cursor */}
      <motion.div
        className="custom-cursor"
        style={{ x: cursorX, y: cursorY }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      />
    </motion.div>
  );
}