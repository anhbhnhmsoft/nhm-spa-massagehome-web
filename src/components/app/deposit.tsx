"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import {
  X,
  QrCode,
  Copy,
  Download,
  CheckCircle2,
  Circle,
  Loader2,
  CircleDollarSign,
} from "lucide-react";

import { useCheckPaymentQRCode, useDeposit } from "@/features/payment/hooks";
import { cn, formatBalance, generateQRCodeImageUrl } from "@/lib/utils";
import {
  _PAYMENT_METHODS,
  _PaymentType,
  _QUICK_AMOUNTS,
} from "@/features/payment/consts";
import useCopyClipboard from "@/features/app/hooks/use-copy-clipboard";
import useSaveFileImage from "@/features/app/hooks/use-save-image";
import { useWalletStore } from "@/features/payment/stores";
import { _UserRole } from "@/features/auth/const";
import { QRWechatData } from "@/features/payment/types";
import HeaderBack from "../header-back";

export default function Deposit({ useFor }: { useFor: _UserRole }) {
  const { t } = useTranslation();
  const {
    configPayment,
    form,
    submitDeposit,
    visibleModalWechat,
    handleCloseWechat,
  } = useDeposit();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedAmount = watch("amount");
  const watchedPayment = watch("payment_type");

  const exchangePriceCny = useMemo(() => {
    if (
      !configPayment?.exchange_rate_vnd_cny ||
      watchedPayment !== _PaymentType.WECHAT_PAY ||
      !watchedAmount
    ) {
      return 0;
    }

    return Number(watchedAmount) / Number(configPayment.exchange_rate_vnd_cny);
  }, [watchedAmount, watchedPayment, configPayment?.exchange_rate_vnd_cny]);
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 pb-32 md:pb-10">
      <HeaderBack title={"payment.deposit_title"} />
      <main className="mx-auto w-full max-w-[750px] px-5 pt-6">
        {/* --- KHỐI NHẬP TIỀN --- */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-4 font-medium text-gray-500">
            {t("payment.deposit_label_input")}
          </p>

          <div className="mb-6">
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <div
                  className={cn(
                    "flex items-center  border-b-2 pb-2 transition-colors",
                    errors.amount
                      ? "border-red-500"
                      : "border-gray-200 focus-within:border-primary-color-1",
                  )}
                >
                  <input
                    type="number"
                    className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-bold text-gray-900 outline-none"
                    placeholder="0"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  />

                  <span className="text-xl font-bold text-gray-400">đ</span>
                </div>
              )}
            />
            {errors.amount && (
              <p className="mt-2 text-sm text-red-500">
                {errors.amount.message as string}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {_QUICK_AMOUNTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setValue("amount", item.toString())}
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {formatBalance(item)}
              </button>
            ))}
          </div>
          {watchedPayment === _PaymentType.WECHAT_PAY && (
            <p className="mt-2 text-xs text-gray-500">
              {t("payment.exchange_rate_wechat_pay", {
                priceCny: formatBalance(exchangePriceCny),
              })}
            </p>
          )}
        </section>

        {/* --- PHƯƠNG THỨC THANH TOÁN --- */}
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {t("payment.payment_methods")}
        </h2>

        <Controller
          control={control}
          name="payment_type"
          render={({ field: { onChange, value } }) => (
            <div className="grid gap-4">
              {_PAYMENT_METHODS.map((method) => {
                const isSelected = value === method.id;
                let disabled = false;
                if (method.id === _PaymentType.QR_BANKING)
                  disabled = !configPayment?.allow_payment?.qrcode;
                else if (method.id === _PaymentType.ZALO_PAY)
                  disabled = !configPayment?.allow_payment?.zalopay;
                else if (method.id === _PaymentType.WECHAT_PAY)
                  disabled = !configPayment?.allow_payment?.wechatpay;

                return (
                  <button
                    key={method.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(method.id)}
                    className={cn(
                      "relative flex items-center rounded-xl border-2 p-4 transition-all text-left",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-transparent bg-white shadow-sm hover:border-gray-200",
                      disabled && "opacity-60 grayscale cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "mr-4 flex h-12 w-12 items-center justify-center rounded-full overflow-hidden",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-400",
                      )}
                    >
                      {method.id === _PaymentType.QR_BANKING && (
                        <QrCode size={24} />
                      )}
                      {method.id === _PaymentType.ZALO_PAY && (
                        <Image
                          src="/assets/icon/zalopay.jpeg"
                          alt="ZaloPay"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {method.id === _PaymentType.WECHAT_PAY && (
                        <Image
                          src="/assets/icon/wechat.png"
                          alt="WeChat"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-bold",
                          isSelected ? "text-blue-900" : "text-gray-900",
                        )}
                      >
                        {t(method.name)}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isSelected ? "text-blue-700" : "text-gray-500",
                        )}
                      >
                        {t(method.desc)}
                      </p>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="text-blue-600" size={24} />
                    ) : (
                      <Circle className="text-gray-300" size={24} />
                    )}

                    {disabled && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/5">
                        <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-red-500 shadow-sm">
                          {t("payment.method_disabled")}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
      </main>

      <footer className="mx-auto fixed max-w-[750px] w-full bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white px-4 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sm:px-5 sm:py-4">
        <div className="mx-auto flex w-full max-w-[750px]items-center gap-3">
          {/* Tổng tiền – luôn hiển thị */}
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-500">
              {t("payment.total_payment")}
            </p>

            <div className="flex items-baseline gap-1 sm:gap-2">
              {watchedPayment === _PaymentType.WECHAT_PAY && (
                <span className="text-[11px] sm:text-xs text-gray-500">
                  ({formatBalance(exchangePriceCny)} CNY)
                </span>
              )}

              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {watchedAmount ? formatBalance(watchedAmount) : "0"} đ
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit(submitDeposit)}
            disabled={
              !watchedAmount || Number(watchedAmount) <= 0 || !watchedPayment
            }
            className={cn(
              `flex-1 min-w-0 rounded-full py-3 sm:py-4 text-sm sm:text-base font-bold text-white transition-all active:scale-95`,
              watchedAmount && Number(watchedAmount) > 0 && watchedPayment
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed",
            )}
          >
            {t("payment.confirm_payment")}
            {watchedAmount && (
              <span className="ml-1 sm:ml-2 font-medium">
                ({formatBalance(watchedAmount)}đ)
              </span>
            )}
          </button>
        </div>
      </footer>

      <CheckQRPaymentModal useFor={useFor} />
      <WeChatPaymentModal
        visible={visibleModalWechat}
        onClose={handleCloseWechat}
      />
    </div>
  );
}

const CheckQRPaymentModal = ({ useFor }: { useFor: _UserRole }) => {
  const { t } = useTranslation();
  const { visible, closeModal, qrBankData } = useCheckPaymentQRCode(useFor);
  const copyToClipboard = useCopyClipboard();
  const { saveURLImage } = useSaveFileImage();

  const QRCodeImageUrl = useMemo(() => {
    if (!qrBankData) return "";
    return generateQRCodeImageUrl({
      bin: qrBankData.bin,
      numberCode: qrBankData.account_number,
      name: qrBankData.account_name,
      money: qrBankData.amount.toString(),
      desc: qrBankData.description,
    });
  }, [qrBankData]);

  if (!visible || !qrBankData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-t-[24px] bg-white sm:rounded-[24px] shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="font-bold text-lg">{t("payment.payment_qr_title")}</h3>
          <button
            onClick={closeModal}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          <div className="mb-6 flex flex-col items-center">
            <div className="relative rounded-2xl border bg-white p-4 shadow-sm">
              <Image
                src={QRCodeImageUrl}
                alt="Banking QR Code"
                width={200}
                height={200}
                className="object-contain"
                priority
                unoptimized // Tránh nén làm mờ mã QR
              />
            </div>
            <button
              onClick={() => saveURLImage(QRCodeImageUrl, "banking-qr")}
              className="mt-4 flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Download size={18} /> {t("common.save_image")}
            </button>
          </div>

          <div className="space-y-4 rounded-xl bg-gray-50 p-5 text-sm">
            <DetailRow
              label={t("payment.bank_name")}
              value={qrBankData.bank_name}
            />
            <DetailRow
              label={t("payment.account_name")}
              value={qrBankData.account_name}
            />
            <DetailRow
              label={t("payment.account_number")}
              value={qrBankData.account_number}
              onCopy={() => copyToClipboard(qrBankData.account_number)}
            />
            <DetailRow
              label={t("payment.total_payment")}
              value={`${formatBalance(qrBankData.amount)} đ`}
              highlight
              onCopy={() => copyToClipboard(qrBankData.amount.toString())}
            />
            <div className="pt-2">
              <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">
                {t("payment.description_qr_bank")}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-red-600 text-base break-all">
                  {qrBankData.description}
                </p>
                <button
                  onClick={() => copyToClipboard(qrBankData.description)}
                  className="text-blue-600 hover:opacity-70"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="mt-1 text-[10px] italic text-red-400">
                {t("payment.description_qr_bank_note")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-blue-600">
            <Loader2 size={20} className="animate-spin" />
            <span className="font-medium">{t("payment.waiting_payment")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeChatPaymentModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const qrWechatData = useWalletStore((state) => state.qrWechatData);
  const copyToClipboard = useCopyClipboard();
  const { saveURLImage } = useSaveFileImage();

  if (!visible || !qrWechatData) return null;
  const { qr_image, amount, description, amount_cny } =
    qrWechatData as QRWechatData;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full max-w-[750px] bg-white shadow-2xl rounded-t-[32px] sm:rounded-[32px] mx-auto">
        <div className="flex items-center justify-between border-b p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#07C160]">
              <Image
                src="/assets/icon/wechat.png"
                alt="WeChat Logo"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </div>
            <h3 className="text-xl font-bold">WeChat Pay</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-6 rounded-[2rem] border-8 border-[#07C160]/10 bg-white p-2">
              <Image
                src={qr_image}
                alt="WeChat QR Code"
                width={224}
                height={224}
                className="object-contain"
                unoptimized
              />
            </div>
            <button
              onClick={() => saveURLImage(qr_image, "wechat-qr")}
              className="flex items-center gap-2 rounded-full bg-[#07C160]/10 px-8 py-3 font-bold text-[#07C160] hover:bg-[#07C160]/20 transition-colors"
            >
              <Download size={20} /> {t("common.save_qr_code")}
            </button>
            <p className="mt-4 text-center text-sm text-gray-500 px-10">
              {t("payment.wechat_scan_instruction")}
            </p>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl bg-gray-50 p-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                  {t("payment.amount")}
                </p>

                <p className="mb-2 text-2xl font-bold text-gray-900">
                  {formatBalance(amount_cny)}
                  <span className="text-sm font-medium"> CNY</span>
                </p>

                <p className="text-sm font-bold text-slate-500">
                  {formatBalance(amount)} {t("common.currency")}
                </p>
              </div>

              <CircleDollarSign size={28} color="#07C160" />
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                {t("payment.transfer_note")}
              </p>
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white p-4">
                <span className="font-bold text-red-600">{description}</span>
                <button
                  onClick={() => copyToClipboard(description)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="mt-2 text-xs italic text-red-400">
                *{t("payment.note_important")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, highlight, onCopy }: any) => (
  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "font-bold text-base",
          highlight ? "text-blue-600" : "text-gray-900",
        )}
      >
        {value}
      </p>
    </div>
    {onCopy && (
      <button
        onClick={onCopy}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Copy size={18} />
      </button>
    )}
  </div>
);
