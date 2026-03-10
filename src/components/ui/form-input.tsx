"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Dùng bản cho Web
import { cn } from "@/lib/utils"; // Giữ nguyên helper shadcn/ui

interface FormInputProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label?: string;
  error?: string;
  required?: boolean;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  description?: string;
  isTextArea?: boolean;
  rows?: number;
}

export const FormInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormInputProps
>(
  (
    {
      label,
      description,
      error,
      required,
      isPassword,
      rightIcon,
      containerClassName,
      className,
      isTextArea,
      rows = 4,
      type,
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Xác định kiểu input: nếu là password và đang hiện thì chuyển thành 'text'
    const inputType = isPassword
      ? isPasswordVisible
        ? "text"
        : "password"
      : type;

    return (
      <div
        className={cn(
          "flex flex-col gap-2 w-full max-w-lg mx-auto",
          containerClassName,
        )}
      >
        {/* Label Section */}
        {label && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="mt-0.5 text-[12px] italic text-slate-500 leading-none">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative flex items-center w-full">
          {isTextArea ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              className={cn(
                "flex w-full rounded-2xl border bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-red-500" : "border-slate-200",
                className,
              )}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={inputType}
              className={cn(
                "flex h-12 w-full rounded-2xl border bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-red-500" : "border-slate-200",
                isPassword || rightIcon ? "pr-12" : "",
                className,
              )}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Icon Container */}
          {!isTextArea && (
            <div className="absolute right-4 flex items-center justify-center cursor-pointer select-none">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  {isPasswordVisible ? (
                    <EyeOff size={20} className="text-slate-500" />
                  ) : (
                    <Eye size={20} className="text-slate-500" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
