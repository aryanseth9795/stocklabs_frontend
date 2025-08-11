import React from 'react'
import { Switch } from '@/components/ui/switch';

const Toggle = ({isTrade, setIsTrade}:{isTrade: boolean, setIsTrade: React.Dispatch<React.SetStateAction<boolean>>}) => {
  return (
     <div className="flex items-center justify-center space-x-8 mb-6 border shadow-md p-4 bg-primary rounded-lg">
        <span className={isTrade ? ' font-extrabold text-3xl' : 'text-muted '}>Trade</span>
        <Switch
          checked={isTrade}
          onCheckedChange={() => setIsTrade(!isTrade)}
          className="bg-blue-600 h-8 w-16"
          
     
        />
        <span className={!isTrade ? 'font-extrabold text-3xl' : 'text-muted'}>
          Transaction
        </span>
      </div>
  )
}

export default Toggle
