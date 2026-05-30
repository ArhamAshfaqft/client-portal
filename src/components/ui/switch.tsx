"use client";

import { type InputHTMLAttributes } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Switch({ label, id, className = "", ...props }: SwitchProps) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          {...props}
        />
        <div className="w-10 h-6 rounded-full border border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors duration-150" />
        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white peer-checked:translate-x-4 transition-transform duration-150 shadow-sm" />
      </div>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
