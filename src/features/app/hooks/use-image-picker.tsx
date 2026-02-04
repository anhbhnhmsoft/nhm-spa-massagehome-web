import { useCallback } from "react";

export const useImagePicker = () => {
  const pickImage = useCallback(
    (callback: (uri: string, file?: File) => void) => {
      // Tạo một input file ẩn
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*"; // Chỉ chấp nhận ảnh

      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
          // Tạo một đường dẫn tạm thời (Blob URL) để hiển thị preview
          const uri = URL.createObjectURL(file);

          // Trả kết quả về qua callback
          callback(uri, file);
        }
      };

      // Kích hoạt click vào input
      input.click();
    },
    [],
  );

  return { pickImage };
};
