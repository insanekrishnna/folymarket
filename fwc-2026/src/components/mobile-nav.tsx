"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  History,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Shield,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MobileNavItem = {
  href: string;
  label: string;
  iconName: string;
};

export function MobileNav({
  items,
  authed,
}: {
  items: MobileNavItem[];
  authed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open menu" />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <div className="flex items-center border-b border-border/40 px-4 py-3">
          <SheetTitle className="text-sm font-semibold tracking-tight">
            Navigate
          </SheetTitle>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((it) => {
            const active =
              pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({
                    variant: active ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "justify-start gap-2.5",
                )}
              >
                <Icon name={it.iconName} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        {authed && (
          <div className="mt-auto border-t border-border/40 p-3">
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

const ICONS: Record<string, LucideIcon> = {
  CalendarDays,
  Newspaper,
  History,
  Swords,
  Users,
  Trophy,
  Shield,
  Settings,
};

function Icon({ name }: { name: string }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp className="size-4" />;
}
