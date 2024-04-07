export interface ILink {
  to: string;
  displayValue: string;
}

export const links: ILink[] = [
  {
    to: "/me/account",
    displayValue: "Account",
  },
  {
    to: "/me/profile",
    displayValue: "Profile",
  },
  {
    to: "/me/security",
    displayValue: "Security",
  },
  {
    to: "/logout",
    displayValue: "Logout",
  },
];

export const baseLinkClasses =
  "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 px-4 py-2 justify-start";
