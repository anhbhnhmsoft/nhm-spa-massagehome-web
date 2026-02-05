import React, { FC, useMemo, useState } from "react";
import {
  X,
  Wallet,
  Trash,
  Plus,
  History,
  Ticket,
  ArrowDownLeft,
  ArrowUpRight,
  ClosedCaptionIcon,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn, formatBalance, formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

// Giả định các hooks đã được bạn viết lại cho bản Web
import {
  useCreateInfoWithdraw,
  useRequestWithdraw,
  useWallet,
  useWithdrawInfo,
} from "@/features/payment/hooks";
import {
  _QUICK_WITHDRAW_AMOUNTS,
  _TransactionInType,
  _TransactionOutType,
  _TransactionStatusColor,
  _TransactionStatusMap,
  _TransactionTypeMap,
} from "@/features/payment/consts";
import { Controller } from "react-hook-form";
import { ListTransactionItem } from "@/features/payment/types";
import { CouponUserItem } from "@/features/service/types";
import SelectModal from "../select-modal";

type WithdrawModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export const WithdrawModal = ({ isVisible, onClose }: WithdrawModalProps) => {
  const { t } = useTranslation();
  const [showModalCreateInfo, setShowModalCreateInfo] = useState(false);
  const [idChoose, setIdChoose] = useState<string>("");

  const { queryListInfoWithdraw, deleteWithdrawInfoItem, isDeleting } =
    useWithdrawInfo(isVisible, onClose);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
        <div
          className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom sm:rounded-3xl"
          style={{ height: "80vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-800">
              {t("payment.withdraw.title_modal")}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Body */}
          <div
            className="flex-1 overflow-y-auto px-5 pt-4 pb-24"
            style={{ height: "calc(100% - 140px)" }}
          >
            {queryListInfoWithdraw.data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-10 text-gray-400">
                <p>{t("payment.withdraw.no_account")}</p>
              </div>
            ) : (
              queryListInfoWithdraw.data?.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => setIdChoose(item.id)}
                  className="mb-3 flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-primary-color-2 transition-all"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-color-2 text-white">
                      <Wallet size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {item.config.bank_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.config.bank_account} - {item.config.bank_holder}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWithdrawInfoItem(item.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    {isDeleting ? (
                      <div className="h-5 w-5 animate-spin border-2 border-gray-300 border-t-red-600 rounded-full" />
                    ) : (
                      <Trash size={20} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 w-full max-w-lg  border-t border-gray-100 bg-white p-5">
            <button
              onClick={() => setShowModalCreateInfo(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-color-2 py-3.5 font-bold text-white hover:opacity-90 transition-opacity"
            >
              <Plus size={22} />
              {t("payment.withdraw.add_new_account")}
            </button>
          </div>
        </div>
      </div>

      <CreateInfoWithdrawModal
        isVisible={showModalCreateInfo}
        onClose={() => setShowModalCreateInfo(false)}
        onSuccess={() => {
          queryListInfoWithdraw.refetch();
          setShowModalCreateInfo(false);
        }}
      />
      <CreateWithdrawTicketModal id={idChoose} setId={setIdChoose} />
    </>
  );
};

type CreateInfoWithdrawModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const CreateInfoWithdrawModal: FC<CreateInfoWithdrawModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  const { form, loading, optionSelectBank, submitCreateWithdrawInfo } =
    useCreateInfoWithdraw(isVisible, onClose, onSuccess);

  const [openSelectBank, setOpenSelectBank] = useState<boolean>(false);
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const bankName = watch("config.bank_name");

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom sm:rounded-3xl h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-xl font-bold text-gray-800">
            {t("payment.withdraw.add_new_account")}
          </h3>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
          >
            <ClosedCaptionIcon size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form Body */}
        <div className="h-full overflow-y-auto px-5 pt-4 pb-28">
          {/* BANK SELECT */}
          <div className="mb-4">
            <label className="mb-1.5 block font-medium text-gray-700">
              {t("payment.bank")} <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setOpenSelectBank(true)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border bg-gray-50 p-3.5 outline-none transition-all",
                (errors.config as any)?.bank_bin
                  ? "border-red-500"
                  : "border-gray-200 focus:border-primary-color-2",
              )}
            >
              <span
                className={
                  bankName ? "font-bold text-gray-900" : "text-gray-400"
                }
              >
                {bankName || t("payment.bank")}
              </span>
              <ChevronDown size={20} className="text-gray-500" />
            </button>

            {/* Modal chọn ngân hàng (Cần được build bằng HTML/Tailwind) */}
            <SelectModal
              isVisible={openSelectBank}
              onClose={() => setOpenSelectBank(false)}
              onSelect={(item: any) => {
                setValue("config.bank_bin", item.value);
                setValue("config.bank_name", item.label);
                setOpenSelectBank(false);
              }}
              data={optionSelectBank}
            />
          </div>

          {/* BANK ACCOUNT */}
          <div className="mb-4">
            <label className="mb-1.5 block font-medium text-gray-700">
              {t("payment.bank_account")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Controller
              name="config.bank_account"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={cn(
                    "w-full rounded-xl border bg-gray-50 p-3.5 text-gray-800 outline-none transition-all",
                    (errors.config as any)?.bank_account
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-primary-color-2",
                  )}
                  placeholder={t("payment.bank_account")}
                />
              )}
            />
            {(errors.config as any)?.bank_account && (
              <p className="ml-1 mt-1 text-xs text-red-500">
                {(errors.config as any).bank_account.message}
              </p>
            )}
          </div>

          {/* BANK HOLDER */}
          <div className="mb-4">
            <label className="mb-1.5 block font-medium text-gray-700">
              {t("payment.bank_holder")} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="config.bank_holder"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={cn(
                    "w-full rounded-xl border bg-gray-50 p-3.5 text-gray-800 outline-none transition-all",
                    (errors.config as any)?.bank_holder
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-primary-color-2",
                  )}
                  placeholder={t("payment.bank_holder")}
                />
              )}
            />
          </div>
        </div>

        {/* Footer Button */}
        <div className="absolute bottom-0 w-full border-t border-gray-100 bg-white p-5">
          <button
            onClick={submitCreateWithdrawInfo}
            disabled={loading}
            className={cn(
              "flex w-full items-center justify-center rounded-xl py-4 text-lg font-bold text-white transition-all",
              loading ? "bg-gray-400" : "bg-primary-color-2 hover:opacity-90",
            )}
          >
            {loading ? (
              <div className="mr-2 h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            {loading ? t("common.loading") : t("payment.add_new_withdraw_info")}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateWithdrawTicketModal = ({
  id,
  setId,
}: {
  id: string;
  setId: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const { form, submitRequestWithdraw, loading, configPayment } =
    useRequestWithdraw(id, setId);
  const {
    register,
    setValue,
    formState: { errors },
    watch,
  } = form;

  const watchedAmount = watch("amount");
  const withdrawCalculation = useMemo(() => {
    // Chuyển đổi và xử lý fallback để tránh lỗi NaN
    const amount = Number(watchedAmount || 0);
    const exchangeRate = Number(configPayment?.currency_exchange_rate || 1);
    const feePercent = Number(configPayment?.fee_withdraw_percentage || 0);

    //  Quy đổi Point sang tiền mặt (Gross)
    const grossAmount = amount * exchangeRate;

    // Tính số tiền phí dựa trên %
    const feeAmount = (grossAmount * feePercent) / 100;

    // Số tiền thực nhận sau khi trừ phí
    const withdrawMoney = Math.floor(grossAmount - feeAmount);

    return {
      feeAmount,
      exchangeRate,
      withdrawMoney,
      feePercent,
    };
  }, [
    configPayment?.currency_exchange_rate,
    configPayment?.fee_withdraw_percentage,
    watchedAmount,
  ]);
  if (id === "") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center ">
      <div className="relative overflow-hidden w-full max-w-lg  rounded-t-3xl  bg-white shadow-2xl animate-in slide-in-from-bottom sm:rounded-3xl h-[85vh] sm:h-[75vh] ">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="text-xl font-bold">
            {t("payment.withdraw.title_modal_request")}
          </h3>
          <button
            onClick={() => setId("")}
            className="rounded-full bg-gray-100 p-2"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 pb-24 h-full">
          <div className="mb-6">
            <label className="mb-2 block font-bold text-gray-700">
              {t("payment.withdraw.enter_withdraw_money")}
            </label>
            <div
              className={cn(
                "flex items-center border-b-2 py-2",
                errors.amount ? "border-red-500" : "border-primary-color-2",
              )}
            >
              <span className="mr-2 text-lg font-bold text-gray-400">
                {t("common.currency")}
              </span>
              <input
                {...register("amount")}
                type="number"
                className="w-full bg-transparent text-3xl font-bold text-primary-color-2 outline-none"
                placeholder="0"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">
                {errors.amount.message as string}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {_QUICK_WITHDRAW_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setValue("amount", amt.toString())}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  {formatBalance(amt)} {t("common.currency")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-row flex-wrap gap-2">
              <span className="font-bold text-base text-primary-color-1">
                {t("payment.withdraw.withdraw_fee")}:{" "}
                {formatBalance(Number(withdrawCalculation.feePercent))} %
              </span>
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-2 block font-bold text-gray-700">
              {t("payment.withdraw.note")}
            </label>
            <textarea
              {...register("note")}
              className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-primary-color-2"
              placeholder={t("payment.withdraw.placeholder_note")}
            />
          </div>
        </div>

        <div className="absolute bottom-0 w-full max-w-lg  border-t bg-white p-5 ">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {t("payment.withdraw.total_withdraw")}:
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                {withdrawCalculation.withdrawMoney
                  ? formatBalance(withdrawCalculation.withdrawMoney)
                  : "0"}{" "}
                {t("common.currency")}
              </span>
            </div>
          </div>

          <button
            onClick={submitRequestWithdraw}
            disabled={loading}
            className={cn(
              "w-full rounded-xl py-4 font-bold text-white transition-all",
              loading
                ? "bg-gray-400"
                : "bg-primary-color-2 hover:bg-opacity-90",
            )}
          >
            {loading ? t("common.loading") : t("payment.request_withdraw")}
          </button>
        </div>
      </div>
    </div>
  );
};
export const HeaderWallet = ({
  queryWallet,
  setTab,
  tab,
  t,
  goToDepositScreen,
  setVisibleWithdraw,
}: any) => {
  return (
    <div className="w-full">
      {/* Thẻ Wallet Gradient */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-color-1 to-primary-color-2 p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm opacity-80">{t("wallet.balance")}</p>
            <div className="flex items-baseline gap-1">
              <h1 className="text-3xl font-extrabold">
                {formatBalance(queryWallet.data?.balance || 0)}
              </h1>
              <span className="text-sm font-bold">{t("common.currency")}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between border-t border-white/20 pt-4">
          <div>
            <p className="text-xs opacity-70">{t("wallet.total_earnings")}</p>
            <p className="font-bold">
              {formatBalance(queryWallet.data?.total_deposit || 0)}{" "}
              {t("common.currency")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">{t("wallet.total_withdrawn")}</p>
            <p className="font-bold">
              {formatBalance(queryWallet.data?.total_withdrawal || 0)}{" "}
              {t("common.currency")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={goToDepositScreen}
            className="flex-1 rounded-xl bg-white/20 py-2.5 font-bold backdrop-blur-md hover:bg-white/30 transition-all"
          >
            {t("wallet.deposit")}
          </button>
          <button
            onClick={() => setVisibleWithdraw(true)}
            className="flex-1 rounded-xl bg-white/20 py-2.5 font-bold backdrop-blur-md hover:bg-white/30 transition-all"
          >
            {t("wallet.withdraw")}
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      {setTab && (
        <div className="mt-4 flex gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            onClick={() => setTab("transaction")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
              tab === "transaction"
                ? "bg-white text-primary-color-2 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <History size={18} />
            {t("wallet.transactions")}
          </button>
          <button
            onClick={() => setTab("coupon")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
              tab === "coupon"
                ? "bg-white text-primary-color-2 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Ticket size={18} />
            {t("wallet.coupons")}
          </button>
        </div>
      )}
    </div>
  );
};

export const TransactionItem = ({ item }: { item: ListTransactionItem }) => {
  const { t } = useTranslation();
  const isInType = _TransactionInType.includes(item.type);
  const isOutType = _TransactionOutType.includes(item.type);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex flex-1 items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isInType
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600",
          )}
        >
          {isInType ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>

        <div className="flex-1 pr-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-1">
            {t(_TransactionTypeMap[item.type])}
          </p>
          <p className="text-base font-bold text-gray-900">
            {formatBalance(item.point_amount)} {t("common.currency")}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span
          style={{ color: _TransactionStatusColor[item.status] }}
          className="text-sm font-medium"
        >
          {t(_TransactionStatusMap[item.status])}
        </span>
        <span className="text-[10px] text-gray-400">
          {dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      </div>
    </div>
  );
};

export const CouponItem = ({ item }: { item: CouponUserItem }) => {
  const { t } = useTranslation();
  const discountDisplay = item.coupon.is_percentage
    ? `${Number(item.coupon.discount_value)}%`
    : formatCurrency(item.coupon.discount_value);

  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-transform active:scale-[0.98]">
      {/* Cột trái: Giá trị */}
      <div className="flex w-24 flex-col items-center justify-center bg-primary-color-2 p-2 text-white border-r border-dashed border-white/40">
        <span className="text-xl font-black">{discountDisplay}</span>
        <span className="text-[10px] uppercase opacity-80">
          {t("common.discount")}
        </span>
      </div>

      {/* Cột phải: Thông tin */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <p className="text-sm font-bold text-slate-700 line-clamp-2">
          {item.coupon.label}
        </p>
        <div className="mt-2">
          <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-primary-color-1 border border-blue-100">
            {item.coupon.code}
          </span>
        </div>
      </div>
    </div>
  );
};
