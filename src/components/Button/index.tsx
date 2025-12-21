type ButtonProps = {
  label: string;
  onClick: () => void;
  variant: "filled" | "outlined";
};

const classNames = {
  filled: "",
  outlined: "",
};

export const Button = ({ label, variant, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="py-1.5 px-2 border border-green-700 rounded-md cursor-pointer bg-green-700 text-shadow-amber-50"
    >
      {label}
    </button>
  );
};
