import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "glass" | "glass-dark" }
>(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-white dark:bg-slate-900 border border-border shadow-sm",
        glass: "glass text-foreground",
        "glass-dark": "glass-dark text-foreground",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl p-6",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});
Card.displayName = "Card";

export { Card };
