import { LucideIcon } from "lucide-react";

interface TabIconProps {
  focused: boolean;
  icon: LucideIcon;
  label: string;
}

export function TabIcon({ focused, icon: Icon, label }: TabIconProps) {
  return (
    <div className="flex flex-col items-center justify-center py-2 transition-all duration-300 ease-in-out">
      <div
        className={`relative p-1 rounded-xl transition-colors duration-300 ${
          focused
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 group-hover:text-gray-600"
        }`}
      >
        <Icon
          size={24}
          strokeWidth={focused ? 2.5 : 2}
          className={`transition-transform duration-300 ${focused ? "scale-110" : "scale-100"}`}
        />
      </div>
      <span
        className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
          focused ? "text-blue-600" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
