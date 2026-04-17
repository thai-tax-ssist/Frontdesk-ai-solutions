'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer group"
    >
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          'h-4 w-4 rounded border border-input ring-offset-background flex items-center justify-center transition-colors',
          'peer-checked:bg-primary peer-checked:border-primary',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
          className
        )}>
          <Check className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
        </div>
      </div>
      {label && <span className="text-sm font-medium leading-none">{label}</span>}
    </label>
  )
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
