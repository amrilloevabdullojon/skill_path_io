"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DropdownItem = {
  id: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
};

type DropdownProps = {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
};

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth ?? 208;
      const menuHeight = menuRef.current?.offsetHeight ?? 0;
      const viewportPadding = 8;

      let nextLeft = align === "right" ? rect.right - menuWidth : rect.left;
      nextLeft = Math.max(viewportPadding, Math.min(nextLeft, window.innerWidth - menuWidth - viewportPadding));

      let nextTop = rect.bottom + 8;
      if (menuHeight > 0 && nextTop + menuHeight > window.innerHeight - viewportPadding) {
        const aboveTop = rect.top - menuHeight - 8;
        nextTop = aboveTop >= viewportPadding ? aboveTop : viewportPadding;
      }

      setPosition({ top: nextTop, left: nextLeft });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current) return;
      const targetNode = event.target as Node;
      const clickInsideRoot = rootRef.current.contains(targetNode);
      const clickInsideMenu = menuRef.current?.contains(targetNode) ?? false;

      if (!clickInsideRoot && !clickInsideMenu) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="focus-ring rounded-xl"
      >
        {trigger}
      </button>
      {open && mounted
        ? createPortal(
            <div
              ref={menuRef}
              className="surface-elevated fixed z-[120] min-w-[13rem] p-1.5 shadow-2xl"
              style={{ top: `${position.top}px`, left: `${position.left}px` }}
              role="menu"
            >
              {items.map((item) => {
                const itemClassName = cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  item.destructive ? "dropdown-item-destructive" : "dropdown-item",
                );

                if (item.href) {
                  return (
                    <a key={item.id} href={item.href} className={itemClassName} onClick={() => setOpen(false)}>
                      {item.label}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={itemClassName}
                    onClick={() => {
                      item.onSelect?.();
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
