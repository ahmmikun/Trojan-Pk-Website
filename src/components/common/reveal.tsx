import { Reveal as MotionReveal } from "@/components/motion/motion";

type Props = {
  children: React.ReactNode;
  /** Seconds to wait before the entrance starts. */
  delay?: number;
  className?: string;
  /** Animate on page load (above-the-fold content) instead of as it scrolls into view. */
  immediate?: boolean;
};

/** Fade-and-rise entrance powered by framer-motion. See components/motion/motion.tsx. */
export function Reveal(props: Props) {
  return <MotionReveal {...props} />;
}
