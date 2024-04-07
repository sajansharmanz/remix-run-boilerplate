import React from "react";

const getPasswordValidationIcon = (value: boolean) => {
  if (value) {
    return <>&#10003;</>;
  }

  return <>&#8226;</>;
};

const usePasswordValidation = () => {
  const [value, setValue] = React.useState<string>("");
  const [passwordValidation, setPasswordValidation] = React.useState({
    minCharacters: false,
    uppercase: false,
    lowercase: false,
    numeric: false,
    specialCharacter: false,
  });

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    setPasswordValidation({
      minCharacters: inputValue.length >= 8,
      uppercase: new RegExp("[A-Z]").test(inputValue),
      lowercase: new RegExp("[a-z]").test(inputValue),
      numeric: new RegExp("[0-9]").test(inputValue),
      specialCharacter: new RegExp(/[^\w\s]/).test(inputValue),
    });
  };

  const component = (
    <div className="mt-1 text-xs text-gray-500" id="password-requirements">
      <p>
        <strong>Password must contain</strong>
      </p>
      <ul>
        <li>
          {getPasswordValidationIcon(passwordValidation.minCharacters)} Min. 8
          Characters
        </li>
        <li>
          {getPasswordValidationIcon(passwordValidation.uppercase)} 1 Uppercase
        </li>
        <li>
          {getPasswordValidationIcon(passwordValidation.lowercase)} 1 Lowercase
        </li>
        <li>
          {getPasswordValidationIcon(passwordValidation.numeric)} 1 Numeric
        </li>
        <li>
          {getPasswordValidationIcon(passwordValidation.specialCharacter)} 1
          Special Character
        </li>
      </ul>
    </div>
  );

  return { component, value, onPasswordChange };
};

export default usePasswordValidation;
