import React, { useCallback, useState } from "react";
import {
  Controller,
  Control,
  UseFormSetValue,
  FieldValues,
  Path,
} from "react-hook-form";
import { MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// Lưu ý: Bạn cần thay thế ListLocationModal bằng phiên bản Web tương ứng
// hoặc tôi có thể giúp bạn viết một bản đơn giản nếu cần.
// import { ListLocationModal } from './ListLocationModal';

type LocationSelectorProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  error?: string;
};

export function LocationSelector<T extends FieldValues>({
  control,
  name,
  setValue,
  error,
}: LocationSelectorProps<T>) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { t } = useTranslation();

  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert(t("Trình duyệt của bạn không hỗ trợ định vị"));
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Trên Web, để lấy địa chỉ (string) từ tọa độ, bạn thường cần
        // một dịch vụ Reverse Geocoding (như Google Maps hoặc OpenStreetMap API)
        const mockAddress = `Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        // Cập nhật field chính
        setValue(name, mockAddress as any, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // Cập nhật fields phụ
        setValue("latitude" as Path<T>, latitude.toString() as any, {
          shouldDirty: true,
        });
        setValue("longitude" as Path<T>, longitude.toString() as any, {
          shouldDirty: true,
        });

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(t("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập."));
      },
    );
  }, [name, setValue, t]);

  return (
    <div className="w-full">
      {/* ===== LABEL ===== */}
      <div className="mb-2 flex flex-row items-center justify-between">
        <label className="text-base font-bold text-slate-900">
          {t("profile.partner_form.field_location_label")}{" "}
          <span className="text-red-500">*</span>
        </label>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex flex-row items-center rounded-lg bg-blue-50 px-3 py-1.5 transition-colors hover:bg-blue-100 active:scale-95 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 size={16} className="mr-1 animate-spin text-blue-600" />
          ) : (
            <MapPin size={16} className="mr-1 text-blue-600" />
          )}
          <span className="text-xs font-medium text-blue-600">
            {isLocating
              ? t("Đang lấy vị trí...")
              : t("profile.partner_form.field_location_button")}
          </span>
        </button>
      </div>

      {/* ===== CONTROLLER: ADDRESS ===== */}
      <Controller
        control={control}
        name={name}
        render={({ field: { value } }) => (
          <>
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex h-12 w-full flex-row items-center rounded-xl bg-gray-100 px-4 transition-colors hover:bg-gray-200"
            >
              <div className="mr-3 rounded-full bg-blue-100 p-2">
                <MapPin size={20} className="text-blue-600" />
              </div>

              <div className="flex-1 text-left overflow-hidden">
                {value ? (
                  <p className="truncate text-base font-medium text-slate-800">
                    {value}
                  </p>
                ) : (
                  <p className="text-base text-gray-400">
                    {t("profile.partner_form.field_location_placeholder")}
                  </p>
                )}
              </div>
            </button>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {/* Logic Modal trên Web thường dùng Portal hoặc Thư viện như Headless UI */}
            {/* Đây là nơi bạn sẽ render ListLocationModal dành cho bản Web */}
          </>
        )}
      />
    </div>
  );
}
