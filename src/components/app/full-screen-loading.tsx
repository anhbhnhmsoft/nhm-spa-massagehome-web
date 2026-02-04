"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  loading: boolean;
  whiteBg?: boolean;
};

export default function FullScreenLoading({ loading, whiteBg }: Props) {
  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999999] flex items-center justify-center ${
        whiteBg ? "bg-white" : "bg-white/30"
      }`}
    >
      {/* Outer circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute flex items-center justify-center"
        style={{ width: 200, height: 200 }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 999,
            borderWidth: 3,
            borderStyle: "solid",
            borderColor: "#2B7BBE",
            borderTopColor: "rgba(156,163,175,0.4)",
            borderRightColor: "rgba(156,163,175,0.4)",
          }}
        />
      </motion.div>

      {/* Middle circle */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="absolute flex items-center justify-center"
        style={{ width: 160, height: 160 }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 999,
            borderWidth: 2.5,
            borderStyle: "solid",
            borderColor: "#2B7BBE",
            borderTopColor: "rgba(156,163,175,0.3)",
            borderLeftColor: "rgba(156,163,175,0.3)",
          }}
        />
      </motion.div>

      {/* Inner circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute flex items-center justify-center"
        style={{ width: 120, height: 120 }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 999,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#2B7BBE",
            borderBottomColor: "rgba(156,163,175,0.3)",
            borderRightColor: "rgba(156,163,175,0.3)",
          }}
        />
      </motion.div>

      {/* Logo pulse */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute flex items-center justify-center"
      >
        <Image
          src="/assets/images/logo.png"
          alt="logo"
          width={100}
          height={100}
          priority
        />
      </motion.div>
    </div>
  );
}
