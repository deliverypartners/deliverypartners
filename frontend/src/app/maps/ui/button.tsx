import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "link" | "default";
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, variant = "default", className = "", children, ...props }, ref) => {
    const base =
      variant === "link"
        ? "bg-transparent text-blue-600 underline hover:text-blue-800 px-0 py-0"
        : "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded";
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        className: `${base} ${className} ${children.props.className ?? ""}`.trim(),
        ...props,
      });
    }
    return (
      <button ref={ref} className={`${base} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button"; 