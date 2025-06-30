import React from "react";

// Props personalizadas
type ButtonOwnProps<C extends React.ElementType> = {
  children: React.ReactNode;
  variant?:
    | "secondary"
    | "primary"
    | "outline"
    | "ghost"
    | "booking"
    | "airbnb"
    | "expedia"
    | "hotels";
  size?: "sm" | "md" | "lg";
  className?: string;
  as?: C; // Prop para cambiar la etiqueta
};

// Tipo final que combina las props con las del elemento HTML
type ButtonProps<C extends React.ElementType> = ButtonOwnProps<C> &
  Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonOwnProps<C>>;

const Button = <C extends React.ElementType = "button">({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as,
  ...rest // 'rest' contiene todas las demás props (onClick, disabled, type, href, etc.)
}: ButtonProps<C>) => {
  // La etiqueta que a renderizar: la que viene en 'as', o 'button' por defecto
  const Component = as || "button";

  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    booking:
      "bg-booking hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition",
    airbnb:
      "bg-airbnb hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition",
    expedia:
      "bg-expedia hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded transition",
    hotels:
      "bg-hotels hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    // Renderizar el 'Component' dinámico
    // y pasarle todas las props restantes con {...rest}
    <Component className={buttonClasses} {...rest}>
      {children}
    </Component>
  );
};

export default Button;
