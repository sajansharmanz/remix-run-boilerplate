import React from "react";

const useGeneralFormError = (): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
] => {
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    const timeout = setTimeout(() => setError(""), 3000);

    return () => clearTimeout(timeout);
  });

  return [error, setError];
};

export default useGeneralFormError;
