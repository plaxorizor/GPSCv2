interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium transition-colors rounded-xl inline-flex items-center justify-center'
  
  const variants = {
    primary: 'bg-gpsc-navy text-white hover:bg-gpsc-green',
    secondary: 'bg-gpsc-green text-white hover:bg-gpsc-green-light',
    outline: 'border border-gpsc-navy text-gpsc-navy hover:bg-gpsc-navy hover:text-white'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}