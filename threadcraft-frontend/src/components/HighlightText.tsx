import { motion } from 'framer-motion';

interface HighlightTextProps {
  children: React.ReactNode;
  color?: string;
}

export default function HighlightText({ children, color = '#8B6BFF' }: HighlightTextProps) {
  return (
    <span className="relative inline-block" style={{ color }}>
      {children}
      <svg
        className="absolute -bottom-2 left-0 w-full h-4 overflow-visible"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 2 7 Q 25 2, 50 7 T 98 7"
          fill="transparent"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </span>
  );
}