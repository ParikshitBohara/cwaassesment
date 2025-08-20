"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

type Props = {
  studentNo: string;
  title?: string;
};

export default function Header({ studentNo, title = "Title" }: Props) {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

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

  return (
    <header className={`${styles.header} ${dark ? styles.headerDark : styles.headerLight} sticky top-0 z-50`}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={`${styles.topBarContent} ${dark ? styles.topBarContentDark : ''}`}>
          <div className="grid grid-cols-3 items-center">
            <div className="text-sm font-semibold">{studentNo}</div>
            <h1 className="text-center text-lg font-semibold">{title}</h1>
            <div />
          </div>
        </div>
      </div>

      {/* Nav row */}
      <div className={styles.navContainer}>
        <div className={`${styles.navBar} ${dark ? styles.navBarDark : ''}`}>
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
                      : `${styles.navLinkInactive} ${dark ? styles.navLinkInactiveDark : ''}`
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
              className={`${styles.hamburgerButton} ${dark ? styles.hamburgerButtonDark : ''}`}
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
                className={`${styles.dropdownMenu} ${dark ? styles.dropdownMenuDark : ''}`}
              >
                <Link
                  role="menuitem"
                  href="/"
                  className={`${styles.dropdownItem} ${dark ? styles.dropdownItemDark : ''}`}
                >
                  Tabs (Home)
                </Link>
                <Link
                  role="menuitem"
                  href="/escape-room"
                  className={`${styles.dropdownItem} ${dark ? styles.dropdownItemDark : ''}`}
                >
                  Escape Room
                </Link>
                <Link
                  role="menuitem"
                  href="/coding-races"
                  className={`${styles.dropdownItem} ${dark ? styles.dropdownItemDark : ''}`}
                >
                  Coding Races
                </Link>
                <Link
                  role="menuitem"
                  href="/court-room"
                  className={`${styles.dropdownItem} ${dark ? styles.dropdownItemDark : ''}`}
                >
                  Court Room
                </Link>
                <div className={`${styles.dropdownDivider} ${dark ? styles.dropdownDividerDark : ''}`} />
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => setDark((v) => !v)}
                  className={`${styles.dropdownItem} ${dark ? styles.dropdownItemDark : ''}`}
                  aria-pressed={dark}
                >
                  {dark ? "🌙 Dark mode: ON" : "☀️ Dark mode: OFF"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dark mode toggle */}
        <div className={styles.darkModeToggle}>
          <label className={`${styles.toggleLabel} ${dark ? styles.toggleLabelDark : ''}`}>
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark((v) => !v)}
              className={styles.toggleCheckbox}
            />
            {dark ? "🌙" : "☀️"} Dark Mode
          </label>
        </div>
      </div>
    </header>
  );
}
