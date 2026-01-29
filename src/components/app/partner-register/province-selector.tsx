import React, { useState } from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// Giả định kiểu dữ liệu từ file types của bạn
type ProvinceItem = {
  id: string;
  code: string;
  name: string;
};

type ProvinceSelectorProps<T extends FieldValues = any> = {
  control: Control<T>;
  name: FieldPath<T>;
  provinces: ProvinceItem[];
  isLoading: boolean;
  error?: string;
};

export default function ProvinceSelector<T extends FieldValues = any>({
  control,
  name,
  provinces,
  isLoading,
  error,
}: ProvinceSelectorProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selectedProvince = provinces.find((p) => p.code === value);

          return (
            <div className="relative group">
              {/* Select Trigger giống TouchableOpacity */}
              <div className="relative">
                <select
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  className={`h-12 w-full appearance-none rounded-xl bg-gray-100 px-4 text-base outline-none ring-offset-2 transition-all focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    selectedProvince ? "text-slate-900" : "text-gray-400"
                  } ${error ? "ring-2 ring-red-500" : ""}`}
                >
                  <option value="" disabled>
                    {t("profile.partner_form.field_city_placeholder")}
                  </option>
                  {provinces.map((item) => (
                    <option key={item.id} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {/* Icon trang trí bên phải */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {/* Thông báo trạng thái nếu không có dữ liệu */}
              {!isLoading && provinces.length === 0 && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {t("common.no_data")}
                </p>
              )}
            </div>
          );
        }}
      />

      {/* Hiển thị lỗi bên dưới */}
      {error && (
        <p className="mt-1 ml-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
