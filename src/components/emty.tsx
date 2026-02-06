"use client";

import React, { FC, ReactNode } from "react";
import { Inbox } from "lucide-react"; // Sử dụng Lucide cho nhẹ và hiện đại
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type EmptyProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  renderAction?: () => ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const Empty: FC<EmptyProps> = ({
  title,
  description,
  icon,
  renderAction,
  className,
  style,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 min-h-[300px] w-full",
        className,
      )}
      style={style}
    >
      {/* --- ICON --- */}
      <div className="text-slate-300 transition-transform duration-300 hover:scale-110">
        {icon || <Inbox size={60} strokeWidth={1.5} />}
      </div>

      {/* --- TITLE --- */}
      <h3 className="mt-4 text-center text-xl font-bold text-slate-500">
        {title || t("common.empty")}
      </h3>

      {/* --- DESCRIPTION --- */}
      {description && (
        <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-slate-400 sm:max-w-sm">
          {description}
        </p>
      )}

      {/* --- ACTION BUTTON --- */}
      {renderAction && (
        <div className="mt-6 flex justify-center">{renderAction()}</div>
      )}
    </div>
  );
};

export default Empty;
