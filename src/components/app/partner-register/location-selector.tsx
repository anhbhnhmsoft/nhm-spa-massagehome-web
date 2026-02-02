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
import { ListLocationModal } from "@/components/location";
import { AddressItem } from "@/features/location/types";
import {
  useGetLocation,
  useLocationAddress,
} from "@/features/app/hooks/use-location";

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
  const { getPermission } = useGetLocation();
  const { location: currentLocation } = useLocationAddress();
  const [isLocating, setIsLocating] = useState(false);
  const { t } = useTranslation();

  const handleGetCurrentLocation = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        setIsLocating(true);

        const hasPermission = await getPermission();
        if (!hasPermission) {
          alert(t("profile.partner_form.alert_location_permission_message"));
          return;
        }

        if (!currentLocation?.address) return;

        // Field chính
        setValue(name, currentLocation.address as any, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // Fields phụ
        const coords = currentLocation.location;

        if (coords?.latitude != null) {
          setValue("latitude" as Path<T>, coords.latitude.toString() as any, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }

        if (coords?.longitude != null) {
          setValue("longitude" as Path<T>, coords.longitude.toString() as any, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error("Get location error:", error);
        alert(t("location.error.current_location_failed"));
      } finally {
        setIsLocating(false);
      }
    },
    [currentLocation, getPermission, name, setValue, t],
  );

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      {/* Header & Button Lấy vị trí */}
      <div className="mb-2 flex flex-row items-center justify-between">
        <label className="text-sm font-bold text-slate-900">
          {t("profile.partner_form.field_location_label")}{" "}
          <span className="text-red-500">*</span>
        </label>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex flex-row items-center rounded-lg bg-blue-50 px-3 py-1.5 transition-colors hover:bg-blue-100 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 size={14} className="mr-1 animate-spin text-blue-600" />
          ) : (
            <MapPin size={14} className="mr-1 text-blue-600" />
          )}
          <span className="text-xs font-medium text-blue-600">
            {t("profile.partner_form.field_location_button")}
          </span>
        </button>
      </div>

      {/* Input hiển thị địa chỉ */}
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowLocationModal(true);
              }}
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

            <ListLocationModal
              visible={showLocationModal}
              onClose={() => setShowLocationModal(false)}
              onSelect={(location: AddressItem) => {
                onChange(location.address);

                if (location.latitude) {
                  setValue(
                    "latitude" as Path<T>,
                    location.latitude.toString() as any,
                    { shouldDirty: true },
                  );
                }
                if (location.longitude) {
                  setValue(
                    "longitude" as Path<T>,
                    location.longitude.toString() as any,
                    { shouldDirty: true },
                  );
                }

                setShowLocationModal(false);
              }}
            />
          </>
        )}
      />
    </div>
  );
}
