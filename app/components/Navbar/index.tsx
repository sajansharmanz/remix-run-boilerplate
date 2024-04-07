import { NavLink } from "@remix-run/react";
import { Menu } from "lucide-react";
import React, { useState } from "react";

import NavbarBrand from "~/components/NavbarBrand";
import NavbarUserDropdown from "~/components/NavbarUserDropdown";
import ThemeToggle from "~/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";

interface MenuItem {
  title: string;
  path: string;
}

const links: Array<MenuItem> = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Pricing",
    path: "/pricing",
  },
  {
    title: "FAQs",
    path: "/faqs",
  },
];

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center justify-start px-2">
        <a href="/" className="mr-10 flex flex-row items-center justify-start">
          <button
            type="button"
            className="mr-2 md:hidden"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(true);
            }}
          >
            <Menu className="h-8 w-auto" />
          </button>
          <NavbarBrand className=" md:flex" />
        </a>
        <div className="hidden md:block">
          <ul className="flex flex-row items-center justify-start">
            {links.map((item, index) => (
              <li key={index} className="mr-6">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "font-bold text-gray-800 dark:text-gray-300"
                      : "text-gray-800 dark:text-gray-300"
                  }
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-1 flex-row items-center justify-end">
          <span className="mr-2">
            <ThemeToggle />
          </span>
          <NavbarUserDropdown />
        </div>
      </nav>
      <Sheet open={mobileMenuOpen} onOpenChange={(o) => setMobileMenuOpen(o)}>
        <SheetContent side="left" className="w-3/4">
          <SheetHeader className="flex flex-row items-center justify-start border-b pb-4">
            <NavbarBrand />
          </SheetHeader>
          <div className="pt-4">
            <ul className="justitfy-start flex flex-col items-start">
              {links.map((item, index) => (
                <li key={index} className="mb-2">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? "font-bold text-gray-800 dark:text-gray-300"
                        : "text-gray-800 dark:text-gray-300"
                    }
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

Navbar.displayName = "Components:Navbar";

export default Navbar;
