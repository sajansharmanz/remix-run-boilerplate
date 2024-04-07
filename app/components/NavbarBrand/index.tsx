import React from "react";

import { useEnvironmentVariables } from "~/components/Providers/EnvironmentVariables";

const NavbarBrand: React.FC<{ className?: string }> = ({ className }) => {
  const { APP_NAME } = useEnvironmentVariables();
  return (
    <div
      data-testid="brand-wrapper"
      className={`flex flex-row items-center justify-start ${className}`}
    >
      <img className="mr-2 h-8 w-auto" src="/icons/image.png" alt="" />
      <span className="font-bold">{APP_NAME}</span>
      {/*
            If you don't want to display an APP_NAME value,
            comment out the above span, and remove the mr-2
            class from the img component
          */}
      {/* <span className="sr-only">{APP_NAME}</span> */}
    </div>
  );
};

NavbarBrand.displayName = "Components:NavbarBrand";

export default NavbarBrand;
