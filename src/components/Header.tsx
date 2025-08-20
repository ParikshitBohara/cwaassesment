"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./Header.module.css";

type Props = {
  studentNo: string;
  title?: string;
};

export default function Header({ studentNo, title = "Title" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  // Close on ESC / click outside
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
      // Simple arrow navigation inside the menu
      if (!menuOpen || !menuRef.current) return;
      const items = menuRef.current.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]');
      if (!items.length) return;
      const i = Array.from(items).indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[(i + 1 + items.length) % items.length] || items[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[(i - 1 + items.length) % items.length] || items[items.length - 1]).focus();
      }
    }
    function onClick(e: MouseEvent) {
      if (!menuOpen) return;
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  const NAV_LEFT = [
    { href: "/", label: "Tabs" },
    { href: "/escape-room", label: "Escape Room" },
    { href: "/coding-races", label: "Coding Races" },
    { href: "/court-room", label: "Court Room" },
  ];

  // Default to dark theme if theme is not yet initialized
  const isDark = theme === 'dark';

  return (
    <header className={`${styles.header} ${isDark ? styles.headerDark : styles.headerLight} sticky top-0 z-50`}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={`${styles.topBarContent} ${isDark ? styles.topBarContentDark : ''}`}>
          <div className="grid grid-cols-3 items-center">
            <div className="text-sm font-semibold">{studentNo}</div>
            <h1 className="text-center text-lg font-semibold">{title}</h1>
            <div />
          </div>
        </div>
      </div>

      {/* Nav row */}
      <div className={styles.navContainer}>
        <div className={`${styles.navBar} ${isDark ? styles.navBarDark : ''}`}>
          <nav aria-label="Primary" className={styles.navLinks}>
            {NAV_LEFT.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${
                    isActive 
                      ? styles.navLinkActive 
                      : `${styles.navLinkInactive} ${isDark ? styles.navLinkInactiveDark : ''}`
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right group: About + hamburger menu */}
          <div className={styles.rightGroup}>
            <Link href="/about" className={styles.aboutLink}>
              About
            </Link>

            <button
              ref={buttonRef}
              type="button"
              className={`${styles.hamburgerButton} ${isDark ? styles.hamburgerButtonDark : ''}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="desktop-menu"
              onClick={() => setMenuOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setMenuOpen(true);
                  setTimeout(() => {
                    menuRef.current
                      ?.querySelector<HTMLAnchorElement>('a[role="menuitem"]')
                      ?.focus();
                  }, 0);
                }
              }}
            >
              <div className={styles.hamburgerIcon}>
                <span className={styles.hamburgerLine} />
                <span className={styles.hamburgerLine} />
                <span className={styles.hamburgerLine} />
              </div>
            </button>

            {/* Modern Dropdown Menu */}
            {menuOpen && (
              <div
                id="desktop-menu"
                ref={menuRef}
                role="menu"
                aria-label="More"
                className={`${styles.dropdownMenu} ${isDark ? styles.dropdownMenuDark : ''}`}
              >
                <Link
                  role="menuitem"
                  href="/"
                  className={`${styles.dropdownItem} ${isDark ? styles.dropdownItemDark : ''}`}
                >
                  Tabs (Home)
                </Link>
                <Link
                  role="menuitem"
                  href="/escape-room"
                  className={`${styles.dropdownItem} ${isDark ? styles.dropdownItemDark : ''}`}
                >
                  Escape Room
                </Link>
                <Link
                  role="menuitem"
                  href="/coding-races"
                  className={`${styles.dropdownItem} ${isDark ? styles.dropdownItemDark : ''}`}
                >
                  Coding Races
                </Link>
                <Link
                  role="menuitem"
                  href="/court-room"
                  className={`${styles.dropdownItem} ${isDark ? styles.dropdownItemDark : ''}`}
                >
                  Court Room
                </Link>
                <div className={`${styles.dropdownDivider} ${isDark ? styles.dropdownDividerDark : ''}`} />
                <button
                  role="menuitem"
                  type="button"
                  onClick={toggleTheme}
                  className={`${styles.dropdownItem} ${isDark ? styles.dropdownItemDark : ''}`}
                  aria-pressed={isDark}
                >
                  {isDark ? "🌙 Dark mode: ON" : "☀️ Dark mode: OFF"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dark mode toggle */}
        <div className={styles.darkModeToggle}>
          <label className={`${styles.toggleLabel} ${isDark ? styles.toggleLabelDark : ''}`}>
            <input
              type="checkbox"
              checked={isDark}
              onChange={toggleTheme}
              className={styles.toggleCheckbox}
            />
            {isDark ? "🌙" : "☀️"} Dark Mode
          </label>
        </div>
      </div>
    </header>
  );
} 