import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  labelExtra?: React.ReactNode;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, labelExtra, helperText, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center mb-1.5">
            <Label htmlFor={id} error={error}>
              {label}
            </Label>
            {labelExtra}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border bg-white px-4 py-2 text-base text-gray-900 shadow-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          id={id}
          {...props}
        />
        {helperText && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
