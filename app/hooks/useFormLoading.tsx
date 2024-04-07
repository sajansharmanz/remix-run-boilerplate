import { useNavigation } from "@remix-run/react";
import React from "react";

const useFormLoading = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (navigation.state === "submitting") {
      setLoading(true);
    } else if (navigation.state === "idle") {
      timeout = setTimeout(() => {
        setLoading(false);
      }, 2000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [navigation.state]);

  if (loading) {
    return (
      <img
        src="/icons/loading.png"
        alt="laoding"
        className="ml-2 h-7 w-auto animate-spin"
      />
    );
  }

  return null;
};

export default useFormLoading;
