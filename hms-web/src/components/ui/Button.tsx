"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
            secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/25",
            outline: "border-2 border-primary text-primary hover:bg-primary/10",
            ghost: "hover:bg-accent/10 hover:text-accent",
            glass: "glass text-foreground hover:bg-white/20 border-white/30",
            danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs w-auto min-w-[80px]",
            md: "h-11 px-6 py-2 text-sm w-auto min-w-[100px]",
            lg: "h-14 px-8 text-base w-auto min-w-[140px]",
            icon: "h-10 w-10 p-0 min-w-0",
        };

        // Use motion.button but strip motion-specific props from interface to avoid conflicts if needed,
        // or just use it as a wrapper. For simplicity and type safety, I'll pass props carefully.
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...(props as HTMLMotionProps<"button">)}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {children as React.ReactNode}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };
