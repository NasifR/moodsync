import React from "react";

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  name,
  value,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer select-none">
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "border-purple-600 bg-purple-100"
            : "border-gray-400 bg-white hover:border-purple-400"
        }`}
      >
        {checked && (
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600 transition-all duration-200" />
        )}
      </div>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="hidden"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default RadioButton;
