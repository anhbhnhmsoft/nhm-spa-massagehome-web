"use client";

import Cookies from "js-cookie";
import { _StorageKey } from "@/lib/storages/key";

/**
 * Tương đương SecureStore (web)
 */
export const SecureStorage = {
  getItem<T>(key: _StorageKey): T | null {
    try {
      const value = Cookies.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  setItem<T>(key: _StorageKey, value: T): boolean {
    try {
      Cookies.set(key, JSON.stringify(value), {
        sameSite: "lax",
        secure: true,
      });
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: _StorageKey): boolean {
    try {
      Cookies.remove(key);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Tương đương AsyncStorage
 */
export const Storage = {
  getItem<T>(key: _StorageKey): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  setItem<T>(key: _StorageKey, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: _StorageKey): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
