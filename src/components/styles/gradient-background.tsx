import React from "react";
import { cn } from "@/lib/utils";

type Direction = "horizontal" | "vertical" | "diagonal";

interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  colors?: [string, string, ...string[]];
  direction?: Direction;
  children?: React.ReactNode;
}

const getDirection = (direction: Direction) => {
  switch (direction) {
    case "vertical":
      return "to bottom";
    case "diagonal":
      return "to bottom right";
    case "horizontal":
    default:
      return "to right";
  }
};

export default function GradientBackground({
  className,
  children,
  colors = ["#044984", "#2B7BBE"],
  direction = "horizontal",
  style,
  ...props
}: GradientBackgroundProps) {
  const gradientDirection = getDirection(direction);

  const backgroundStyle: React.CSSProperties = {
    background: `linear-gradient(${gradientDirection}, ${colors.join(", ")})`,
    ...style,
  };

  return (
    <div className={cn("w-full", className)} style={backgroundStyle} {...props}>
      {children}
    </div>
  );
}
