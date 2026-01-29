import React from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";

type ImageSlotProps = {
  uri: string | null;
  label: string;
  onAdd: () => void;
  onRemove?: () => void;
};

export default function ImageSlot({
  uri,
  label,
  onAdd,
  onRemove,
}: ImageSlotProps) {
  return (
    <div
      onClick={onAdd}
      className="relative h-32 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex transition-hover hover:bg-gray-100"
    >
      {uri ? (
        <>
          {/* Thay thế expo-image bằng next/image */}
          <Image
            src={uri}
            alt={label}
            fill
            className="object-cover rounded-xl"
          />

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn sự kiện onAdd khi bấm xóa
                onRemove();
              }}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 z-10 text-white hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <Trash2 size={14} />
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <ImagePlus size={24} className="text-gray-400" />
          <span className="mt-1 text-[10px] text-gray-400 font-medium">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
