import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-tiny font-semibold uppercase tracking-wide text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3
            text-body text-black
            bg-white
            border-2 border-gray-200
            transition-colors duration-150
            placeholder:text-gray-400
            hover:border-gray-300
            focus:outline-none focus:border-swiss-red
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-swiss-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-tiny text-swiss-red font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-tiny text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
