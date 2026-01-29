import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Star,
  Trash2,
  PlusCircle,
  Map,
  Loader2,
  X,
  Tag,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useListLocation,
  useSaveLocation,
  useSearchLocation,
} from "@/features/location/hooks";
import { Controller } from "react-hook-form";
import { DetailLocation } from "@/features/location/types";
// Giả định hooks của bạn đã có phiên bản cho Web

type ListLocationModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (location: any) => void;
};

export const ListLocationModal = ({
  visible,
  onClose,
  onSelect,
}: ListLocationModalProps) => {
  const { t } = useTranslation();
  const {
    queryList,
    createHandler,
    editHandler,
    deleteHandler,
    closeSaveModal,
    showSaveModal,
  } = useListLocation();

  const { data, isFetchingNextPage } = queryList;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold text-slate-800">
            {t("location.title")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* LIST CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((item: any, index: number) => (
                <div
                  key={`location-${item.id}-${index}`}
                  onClick={() =>
                    onSelect ? onSelect(item) : editHandler(item)
                  }
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <div
                    className={cn(
                      "mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      item.is_primary ? "bg-orange-100" : "bg-gray-100",
                    )}
                  >
                    <Star
                      size={20}
                      className={
                        item.is_primary ? "text-orange-500" : "text-slate-500"
                      }
                      fill={item.is_primary ? "currentColor" : "none"}
                    />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-bold text-slate-800">
                      {item.address.split(",")[0]}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {item.desc ? `${item.desc} ` : t("location.no_desc")} -{" "}
                      {item.address}
                    </p>
                  </div>

                  {!onSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHandler(item);
                      }}
                      className="ml-2 p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}

              {/* FOOTER ACTION */}
              <div className="pt-2 pb-10">
                {isFetchingNextPage ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <button
                    onClick={createHandler}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-500 bg-blue-50/50 py-4 font-medium text-blue-600 hover:bg-blue-100"
                  >
                    <PlusCircle size={20} />
                    {t("location.add_new_address")}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gray-50">
                <Map size={80} className="text-gray-200" />
                <MapPin size={40} className="absolute text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">
                {t("location.common_address")}
              </h3>
              <p className="mb-8 text-gray-500">{t("location.description")}</p>
              <button
                onClick={createHandler}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
              >
                <PlusCircle size={20} />
                {t("location.add_new_address")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal lồng bên trong */}
      <SaveLocationModal visible={showSaveModal} onClose={closeSaveModal} />
    </div>
  );
};

export const SaveLocationModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const { form, submit, isEdit, setLocationCurrent, loading } =
    useSaveLocation(onClose);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const currentAddress = watch("address");

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center border-b p-4">
          <button onClick={onClose} className="mr-3">
            <X size={20} />
          </button>
          <h2 className="font-bold">
            {isEdit ? t("location.title_edit") : t("location.title_add")}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* ĐỊA CHỈ */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold">
                {t("location.label_address")} *
              </label>
              <button
                type="button"
                onClick={setLocationCurrent}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
              >
                <MapPin size={14} /> {t("location.get_current_location")}
              </button>
            </div>

            <button
              onClick={() => setShowSearch(true)}
              className="flex w-full items-center rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 transition-all"
            >
              <div className="mr-3 rounded-full bg-blue-50 p-2 text-blue-600">
                <MapPin size={20} />
              </div>
              <span
                className={cn(
                  "flex-1",
                  currentAddress
                    ? "text-slate-800 font-medium"
                    : "text-gray-400",
                )}
              >
                {currentAddress || t("location.placeholder_address")}
              </span>
            </button>
            {errors.address && (
              <p className="mt-2 text-xs text-red-500">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* GHI CHÚ */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              {t("location.label_desc")}
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-4 top-4 text-gray-400" />
              <Controller
                control={control}
                name="desc"
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 pl-11 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("location.placeholder_desc")}
                  />
                )}
              />
            </div>
          </div>

          {/* IS PRIMARY */}
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-bold text-slate-800">
                {t("location.is_primary")}
              </p>
              <p className="text-xs text-gray-500">
                {t("location.is_primary_desc")}
              </p>
            </div>
            <Controller
              control={control}
              name="is_primary"
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors checked:bg-blue-500 relative before:content-[''] before:absolute before:h-5 before:w-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                />
              )}
            />
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleSubmit(submit)}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              t("location.save_address")
            )}
          </button>
        </div>

        <SearchLocationModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectLocation={(loc) => {
            setValue("address", loc.formatted_address, {
              shouldValidate: true,
            });
            setValue("latitude", loc.latitude, { shouldValidate: true });
            setValue("longitude", loc.longitude, { shouldValidate: true });
            setShowSearch(false);
          }}
        />
      </div>
    </div>
  );
};

type LocationSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: DetailLocation) => void;
};

export const SearchLocationModal: FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const { t } = useTranslation();
  const {
    keyword,
    results,
    loading,
    handleChangeText,
    clearKeyword,
    handleSelect,
  } = useSearchLocation();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-white animate-in slide-in-from-bottom duration-300 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-[600px] sm:w-[500px] sm:rounded-2xl sm:shadow-2xl sm:border overflow-hidden flex flex-col">
      {/* HEADER: Search Bar */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-800" />
        </button>

        <div className="flex-1 flex flex-row items-center rounded-xl bg-gray-100 px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
          {/* Chấm tròn cam */}
          <div className="mr-3 h-2 w-2 shrink-0 rounded-full bg-orange-500" />

          <input
            className="flex-1 bg-transparent text-base leading-5 text-slate-800 outline-none placeholder:text-gray-400"
            placeholder={t("location.search_placeholder")}
            value={keyword}
            onChange={(e) => handleChangeText(e.target.value)}
            autoFocus
          />

          {keyword.length > 0 && (
            <button
              onClick={clearKeyword}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT: Results List */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="flex flex-col">
            {results && results.length > 0
              ? results.map((item: any) => (
                  <button
                    key={item.place_id}
                    className="flex w-full flex-row items-center border-b border-gray-50 px-4 py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                    onClick={() => handleSelect(item, onSelectLocation)}
                  >
                    <div className="mr-4 shrink-0 rounded-full bg-gray-100 p-2 text-slate-600">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-base font-medium text-slate-800 truncate">
                        {item.formatted_address}
                      </p>
                    </div>
                  </button>
                ))
              : /* EMPTY STATE */
                !loading &&
                keyword.length > 2 && (
                  <div className="flex flex-col items-center p-12 text-center text-gray-500">
                    <MapPin size={48} className="mb-2 text-gray-200" />
                    <p>{t("location.no_result")}</p>
                  </div>
                )}
          </div>
        )}
      </div>

      {/* Nút đóng cho phiên bản Desktop (tùy chọn) */}
      <div className="sm:hidden p-4 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-slate-600 border border-gray-200 bg-white"
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
};
