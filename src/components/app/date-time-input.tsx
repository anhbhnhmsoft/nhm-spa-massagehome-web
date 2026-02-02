"use client";

import React, { useRef } from "react";
import dayjs from "dayjs";
import { Calendar, Clock } from "lucide-react";

type DateTimePickerInputProps = {
  value: Date;
  onChange: (date: Date) => void;
  mode: "date" | "time";
};

export default function DateTimePickerInput({
  value,
  onChange,
  mode,
}: DateTimePickerInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const displayFormat = mode === "date" ? "DD/MM/YYYY" : "HH:mm";
  const htmlFormat = mode === "date" ? "YYYY-MM-DD" : "HH:mm";

  const handleOpenPicker = () => {
    const input = inputRef.current;
    if (!input) return;

    // ✅ TS-safe
    if (typeof (input as any).showPicker === "function") {
      (input as any).showPicker();
    } else {
      input.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    const newDate = new Date(value);

    if (mode === "date") {
      const [y, m, d] = val.split("-").map(Number);
      newDate.setFullYear(y);
      newDate.setMonth(m - 1);
      newDate.setDate(d);
    }

    if (mode === "time") {
      const [h, min] = val.split(":").map(Number);
      if (h < 1) return; // ❌ chặn 00:xx

      newDate.setHours(h);
      newDate.setMinutes(min);
      newDate.setSeconds(0);
    }

    onChange(newDate);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={mode}
        value={dayjs(value).format(htmlFormat)}
        min={mode === "time" ? "01:00" : undefined}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
      />

      <div
        onClick={handleOpenPicker}
        className="w-full border border-slate-300 rounded-2xl px-4 py-3 flex justify-between items-center bg-white hover:border-blue-500 cursor-pointer"
      >
        <span className="font-medium">
          {dayjs(value).format(displayFormat)}
        </span>

        {mode === "date" ? <Calendar size={20} /> : <Clock size={20} />}
      </div>
    </div>
  );
}
