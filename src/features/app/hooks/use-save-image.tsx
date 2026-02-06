import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Hook hỗ trợ lưu hình ảnh từ URL về máy tính người dùng trên trình duyệt
 */
const useSaveFileImage = () => {
  const { t } = useTranslation();

  const saveURLImage = useCallback(
    async (url: string, fileName: string = "image") => {
      try {
        // 1. Fetch dữ liệu hình ảnh dưới dạng Blob
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();

        // 2. Tạo một URL tạm thời cho Blob này
        const blobUrl = window.URL.createObjectURL(blob);

        // 3. Tạo thẻ <a> ẩn để kích hoạt trình tải xuống của trình duyệt
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${fileName}_${Date.now()}.png`; // Đặt tên file khi lưu

        // 4. Thêm vào DOM, click và xóa ngay lập tức
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 5. Giải phóng bộ nhớ của URL tạm
        window.URL.revokeObjectURL(blobUrl);

        // Thông báo thành công (Có thể dùng toast hoặc alert tùy UI của bạn)
        alert(t("common_success.save_image_success"));
      } catch (error) {
        console.error("Save image error:", error);
        alert(t("common_error.error_save_image"));
      }
    },
    [t],
  );

  const downloadImageByLink = (url: string, fileName = "image") => {
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}_${Date.now()}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();

    // cleanup
    setTimeout(() => {
      document.body.removeChild(link);
    }, 0);
  };

  return {
    saveURLImage,
    downloadImageByLink,
  };
};

export default useSaveFileImage;
