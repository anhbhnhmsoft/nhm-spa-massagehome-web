import React, { Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { X, Star, Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useReviewModal } from "@/features/service/hooks";

interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceBookingId: string;
}

export const ReviewModal = ({
  isVisible,
  onClose,
  onSuccess,
  serviceBookingId,
}: ReviewModalProps) => {
  const { t } = useTranslation();
  const { form, onSubmit, loading } = useReviewModal(
    serviceBookingId,
    onSuccess,
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <Transition show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay background */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
              enterTo="translate-y-0 sm:scale-100 sm:opacity-100"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 sm:scale-100 sm:opacity-100"
              leaveTo="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
            >
              <Dialog.Panel className="relative w-full transform overflow-hidden rounded-t-[2rem] bg-white p-6 text-left shadow-xl transition-all sm:max-w-lg sm:rounded-3xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {t("services.review.title")}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} className="text-gray-900" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Rating Stars */}
                  <div className="flex flex-col items-center">
                    <p className="mb-2 font-medium text-gray-700">
                      {t("services.review.rating")}
                    </p>
                    <Controller
                      control={control}
                      name="rating"
                      render={({ field: { onChange, value } }) => (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => onChange(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                size={32}
                                fill={star <= value ? "#FFC107" : "none"}
                                color={star <= value ? "#FFC107" : "#D1D5DB"}
                                className="transition-transform active:scale-90"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Comment Input */}
                  <div>
                    <Controller
                      control={control}
                      name="comment"
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className={cn(
                            "w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none focus:border-primary-color-2 focus:ring-1 focus:ring-primary-color-2",
                            errors.comment && "border-red-500",
                          )}
                          placeholder={t("services.review.comment")}
                        />
                      )}
                    />
                    {errors.comment && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.comment.message as string}
                      </p>
                    )}
                  </div>

                  {/* Hidden Option (Ẩn danh) */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {t("services.review.hidden")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t("services.review.hidden_description")}
                      </span>
                    </div>
                    <Controller
                      control={control}
                      name="hidden"
                      render={({ field: { onChange, value } }) => (
                        <Switch
                          checked={value}
                          onChange={onChange}
                          className={cn(
                            value ? "bg-blue-600" : "bg-gray-200",
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          )}
                        >
                          <span
                            className={cn(
                              value ? "translate-x-6" : "translate-x-1",
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            )}
                          />
                        </Switch>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "flex w-full items-center justify-center rounded-2xl py-4 text-lg font-bold text-white transition-all active:scale-[0.98]",
                      loading
                        ? "cursor-not-allowed bg-gray-300"
                        : "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      t("services.review.submit")
                    )}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
