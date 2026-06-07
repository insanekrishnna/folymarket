import Link from "next/link";
import {
  CalendarDays,
  History,
  LogOut,
  Newspaper,
  Settings,
  Shield,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutAction } from "@/lib/actions/auth";
import { Brand } from "@/components/brand";
import { MobileNav, type MobileNavItem } from "@/components/mobile-nav";

export async function Navbar() {
  const user = await getCurrentUser();

  const publicItems: MobileNavItem[] = [
    { href: "/fixtures", label: "Schedule", iconName: "CalendarDays" },
    { href: "/news", label: "News", iconName: "Newspaper" },
    { href: "/history", label: "History", iconName: "History" },
  ];

  const userItems: MobileNavItem[] = user
    ? [
        { href: "/predictions", label: "Predictions", iconName: "Swords" },
        { href: "/leagues", label: "Leagues", iconName: "Users" },
        { href: "/ranking", label: "Leaderboard", iconName: "Trophy" },
        ...(user.role === "ADMIN"
          ? [{ href: "/admin", label: "Admin", iconName: "Shield" }]
          : []),
      ]
    : [];

  const mobileItems: MobileNavItem[] = [
    ...publicItems,
    ...userItems,
    { href: "/settings", label: "Preferences", iconName: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/65 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-[22px]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight"
        >
          <Brand size="md" />
          <span className="hidden text-sm text-black/60 sm:inline">
            World Cup 2026
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <NavLink
            href="/fixtures"
            icon={<CalendarDays className="size-3.5" />}
            label="Schedule"
          />
          <NavLink
            href="/news"
            icon={<Newspaper className="size-3.5" />}
            label="News"
          />
          <NavLink
            href="/history"
            icon={<History className="size-3.5" />}
            label="History"
          />
          {user ? (
            <>
              <NavLink
                href="/predictions"
                icon={<Swords className="size-3.5" />}
                label="Predictions"
              />
              <NavLink
                href="/leagues"
                icon={<Users className="size-3.5" />}
                label="Leagues"
              />
              <NavLink
                href="/ranking"
                icon={<Trophy className="size-3.5" />}
                label="Leaderboard"
              />
              {user.role === "ADMIN" && (
                <NavLink
                  href="/admin"
                  icon={<Shield className="size-3.5" />}
                  label="Admin"
                />
              )}
              <UserMenu
                name={user.name ?? "User"}
                email={user.email ?? null}
                image={user.image ?? null}
              />
            </>
          ) : (
            <>
              <Link
                href="/settings"
                className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1.5"}
                aria-label="Preferences"
              >
                <Settings className="size-3.5" />
                <span>Preferences</span>
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 md:hidden">
          {user ? (
            <UserMenu
              name={user.name ?? "User"}
              email={user.email ?? null}
              image={user.image ?? null}
            />
          ) : (
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Sign in
            </Link>
          )}
          <MobileNav items={mobileItems} authed={!!user} />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1.5"}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function UserMenu({
  name,
  email,
  image,
}: {
  name: string;
  email: string | null;
  image: string | null;
}) {
  const initials =
    name
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="User menu"
          />
        }
      >
        <Avatar className="h-8 w-8 border border-black/10">
          {image && (
            <AvatarImage src={image} alt={name} referrerPolicy="no-referrer" />
          )}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-black/10">
              {image && (
                <AvatarImage
                  src={image}
                  alt={name}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{name}</div>
              {email && (
                <div className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </div>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/settings" className="flex cursor-pointer items-center gap-2" />
          }
        >
          <Settings className="size-4" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem
            nativeButton
            render={
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2"
              />
            }
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
