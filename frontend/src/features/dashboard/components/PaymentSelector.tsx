import React from 'react';
import { useApp } from '@/context/useApp';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankCard } from './BankCard';
import { Landmark } from 'lucide-react';

interface PaymentSelectorProps {
  selectedId: string | undefined;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selectedId, onChange, disabled }) => {
  const { paymentMethods } = useApp();
  const selectedMethod = paymentMethods.find(m => m.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Payment Details
        </Label>
        <Select value={selectedId} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 rounded-xl text-white focus:ring-primary/50 transition-all">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent className="bg-glass border-white/10 backdrop-blur-xl text-white">
            {paymentMethods.length > 0 ? (
              paymentMethods.map(method => (
                <SelectItem 
                  key={method.id} 
                  value={method.id}
                  className="focus:bg-primary/20 focus:text-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {method.type === 'upi' ? (
                      <span className="text-neon-purple">⚡</span>
                    ) : (
                      <Landmark className="h-4 w-4 text-neon-blue" />
                    )}
                    <span>{method.label} {method.isDefault && '(Default)'}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No payment methods found. 
                <br />
                Go to Bank Details to add one.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedMethod && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex justify-end">
          <div className="w-full max-w-md">
            <BankCard 
              method={selectedMethod} 
              compact 
            />
          </div>
        </div>
      )}
    </div>
  );
};
