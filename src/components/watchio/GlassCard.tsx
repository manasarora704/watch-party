import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={cn("panel-surface relative overflow-hidden rounded-2xl p-6", className)}
      {...props}
    >
      <div className="card-highlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100" />
      {children}
    </motion.div>
  );
}
