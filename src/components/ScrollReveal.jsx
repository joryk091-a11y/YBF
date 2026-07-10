import React, { useEffect, useRef, useState } from 'react';














export default function ScrollReveal({
  children,
  animation = 'fade-up',
  duration = 750,
  delay = 0,
  threshold = 0.1,
  className = '',
  once = true,
}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  
  const getAnimationClasses = () => {
    const transitions = {
      'fade-up': {
        initial: 'translate-y-12 opacity-0',
        active: 'translate-y-0 opacity-100',
      },
      'fade-down': {
        initial: '-translate-y-12 opacity-0',
        active: 'translate-y-0 opacity-100',
      },
      'fade-left': {
        initial: 'translate-x-12 opacity-0',
        active: 'translate-x-0 opacity-100',
      },
      'fade-right': {
        initial: '-translate-x-12 opacity-0',
        active: 'translate-x-0 opacity-100',
      },
      'scale-up': {
        initial: 'scale-[0.93] opacity-0',
        active: 'scale-100 opacity-100',
      },
      'zoom-in': {
        initial: 'scale-90 opacity-0',
        active: 'scale-100 opacity-100',
      },
    };

    const current = transitions[animation] || transitions['fade-up'];
    return isIntersecting ? current.active : current.initial;
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out will-change-transform ${getAnimationClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
