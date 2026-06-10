import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

const pageVariants: any = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } }
};

export const PageWrapper = ({ children, className = '', style }: { children: ReactNode, className?: string, style?: CSSProperties }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};
