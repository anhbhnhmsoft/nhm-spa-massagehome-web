import React, { useState, useMemo, FC } from "react";
import { Search, X, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (item: SelectOption) => void;
  data: SelectOption[];
  value?: string | number;
}

const SelectModal: FC<Props> = ({
  isVisible,
  onClose,
  onSelect,
  data,
  value,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc dữ liệu dựa trên từ khóa tìm kiếm
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  const handleSelect = (item: SelectOption) => {
    onSelect(item);
    onClose();
    setSearchQuery("");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 transition-opacity sm:items-center p-0 sm:p-4">
      {/* Backdrop: Click để đóng */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative h-[85vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-2xl sm:h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 text-lg">
            {t("common.select_title")}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary-color-2/20 transition-all">
            <Search size={20} className="text-gray-400" />
            <input
              className="flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              placeholder={t("common.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} className="fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* List Data */}
        <div className="h-full overflow-y-auto pb-20">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              const isSelected = item.value === value;
              return (
                <button
                  key={item.value.toString()}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex w-full items-center justify-between border-b border-gray-50 p-4 transition-colors",
                    isSelected ? "bg-blue-50/50" : "bg-white hover:bg-gray-50",
                  )}
                >
                  <span
                    className={cn(
                      "text-base text-left flex-1",
                      isSelected
                        ? "font-bold text-primary-color-2"
                        : "font-medium text-gray-700",
                    )}
                  >
                    {item.label}
                  </span>

                  {isSelected && (
                    <CheckCircle2 size={22} className="text-primary-color-2" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center text-gray-400">
              <Search size={48} className="mb-2 opacity-20" />
              <p className="font-medium">{t("common.no_results")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectModal;
