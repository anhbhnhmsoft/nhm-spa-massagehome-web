import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { _LanguageCode } from "./const";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const checkLanguage = (lang: string) => {
  return [_LanguageCode.EN, _LanguageCode.VI, _LanguageCode.CN].includes(
    lang as _LanguageCode,
  );
};
