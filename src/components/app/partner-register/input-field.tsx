import React from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";

type InputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  type?: "text" | "number" | "email" | "tel" | "password"; // Thay thế cho keyboardType
  disabled?: boolean;
};

export const InputField = <T extends FieldValues>({
  control,
  name,
  placeholder,
  error,
  multiline = false,
  numberOfLines = 4,
  type = "text",
  disabled = false,
}: InputFieldProps<T>) => {
  return (
    <div className="w-full transition-all">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) =>
          multiline ? (
            <textarea
              rows={numberOfLines}
              className={`w-full rounded-xl bg-gray-100 px-4 py-3 text-base text-slate-900 outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none ${
                error ? "ring-2 ring-red-500" : ""
              }`}
              placeholder={placeholder}
              onBlur={onBlur}
              onChange={onChange}
              value={value || ""}
              disabled={disabled}
            />
          ) : (
            <input
              type={type}
              className={`w-full rounded-xl bg-gray-100 px-4 py-3 text-base text-slate-900 outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                error ? "ring-2 ring-red-500" : ""
              }`}
              placeholder={placeholder}
              onBlur={onBlur}
              onChange={(e) => {
                const val =
                  type === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value;
                onChange(val);
              }}
              value={value || ""}
              disabled={disabled}
            />
          )
        }
      />
      {/* Tự viết component Text lỗi tại đây */}
      {error && (
        <p className="mt-1 ml-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
