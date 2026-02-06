import React, { useEffect, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A'
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Main Dot */}
      <div 
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-temur-gold pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${position.x - 8}px, ${position.y - 8}px) scale(${isPointer ? 1.5 : 1})`
        }}
      />
      {/* Trailing Ring */}
      <div 
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-temur-gold/50 pointer-events-none z-[9998] transition-all duration-300 ease-out"
        style={{
          transform: `translate(${position.x - 20}px, ${position.y - 20}px) scale(${isPointer ? 1.2 : 1})`,
          opacity: isPointer ? 0.8 : 0.4
        }}
      />
    </>
  );
};

export default CustomCursor;