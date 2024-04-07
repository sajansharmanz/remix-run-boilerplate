import { NavLink, Outlet } from "@remix-run/react";

import { baseLinkClasses, links } from "~/routes/me/helpers";

export default function MeLayout() {
  return (
    <div className="w-ful flex min-h-screen flex-col">
      <main className="container mt-8">
        <h2 className="text-4xl font-bold">Your Account</h2>
        <p className="text-muted-foreground">Manage your account</p>
        <hr className="my-4" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="scrolling-auto -mx-4 overflow-x-scroll md:w-screen lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              {links.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? `${baseLinkClasses} bg-muted hover:bg-muted`
                      : `${baseLinkClasses} hover:bg-transparent hover:underline`
                  }
                >
                  {link.displayValue}
                </NavLink>
              ))}
            </nav>
          </aside>
          <section className="flex-1 lg:max-w-2xl">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
