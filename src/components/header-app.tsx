"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, User, Menu, X, Leaf } from "lucide-react"; // Sử dụng Lucide React bản Web
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Giả lập trạng thái checkAuth từ code Expo của bạn
  const isLoggedIn = false;

  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Dịch vụ", href: "/services" },
    { name: "Kỹ thuật viên", href: "/masseurs" },
    { name: "Về chúng tôi", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-105 transition-transform">
            <Leaf size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-none text-[#001E37] dark:text-white tracking-tight">
              MASSA HOME
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Wellness Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-foreground/70"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Moon size={20} className="text-foreground" />
          </button>

          <div className="hidden md:block h-6 w-[1px] bg-border mx-2" />

          {isLoggedIn ? (
            <Link href="/profile">
              <button>
                <User size={20} />
              </button>
            </Link>
          ) : (
            <Link href="/auth">
              <button className="hidden md:block bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                Đăng nhập / Đăng ký
              </button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium p-2"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/auth"
              className="mt-4 bg-primary text-white text-center py-3 rounded-lg"
            >
              Đăng nhập / Đăng ký
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
