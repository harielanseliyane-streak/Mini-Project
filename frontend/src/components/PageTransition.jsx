import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition
 * Wraps page content and animates a fade+slide on every route change.
 * Uses a pure CSS class approach — no external deps.
 */
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // Start exit
    setPhase('out');
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setPhase('in');
    }, 250); // match CSS duration
    return () => clearTimeout(t);
  }, [pathname, children]);

  // On first mount / same route child update (no transition needed)
  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <div
      className={`page-transition-wrapper ${phase === 'out' ? 'page-exit' : 'page-enter'}`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
