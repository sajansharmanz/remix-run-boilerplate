import { Link } from "@remix-run/react";
import React from "react";

import { useUser } from "~/components/Providers/User";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const NavbarUserDropdown: React.FC = () => {
  const { user, avatar } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar ?? "/icons/user.png"} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.email ? (
          <>
            <Link to="/me/account">
              <DropdownMenuItem>Account</DropdownMenuItem>
            </Link>
            <Link to="/me/profile">
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </Link>
            <Link to="/me/security">
              <DropdownMenuItem>Security</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link to="/logout">
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <DropdownMenuItem>Login</DropdownMenuItem>
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

NavbarUserDropdown.displayName = "Components:NavbarUserDropdown";

export default NavbarUserDropdown;
