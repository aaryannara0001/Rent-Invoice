import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentMethod } from '@/context/types';
import { Landmark, Terminal, QrCode } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (method: PaymentMethod) => void;
  editingMethod: PaymentMethod | null;
}

export const AddBankModal: React.FC<AddBankModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMethod,
}) => {
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: 'bank',
    label: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    isDefault: false,
  });

  useEffect(() => {
    if (editingMethod) {
      setFormData(editingMethod);
    } else {
      setFormData({
        type: 'bank',
        label: '',
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        isDefault: false,
      });
    }
  }, [editingMethod, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMethod: PaymentMethod = {
      ...formData,
      id: editingMethod?.id || `PM-${Date.now()}`,
      createdAt: editingMethod?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as PaymentMethod;
    onSave(newMethod);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-glass border-white/10 backdrop-blur-2xl text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your payment details below to receive payments for invoices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Label</Label>
              <Input
                placeholder="e.g., Primary Bank, personal UPI"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="mt-1.5 bg-white/5 border-white/10 focus:border-primary/50 text-white h-11"
                required
              />
            </div>

            <Tabs 
              defaultValue={formData.type} 
              onValueChange={(v) => setFormData({ ...formData, type: v as 'bank' | 'upi' })}
              className="w-full"
            >
              <TabsList className="w-full bg-white/5 border border-white/10 p-1 mb-4 h-12">
                <TabsTrigger value="bank" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all rounded-lg">
                  <Landmark className="h-4 w-4 mr-2" />
                  Bank Account
                </TabsTrigger>
                <TabsTrigger value="upi" className="flex-1 data-[state=active]:bg-accent/20 data-[state=active]:text-accent transition-all rounded-lg">
                  <span className="mr-2">⚡</span>
                  UPI ID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bank" className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Holder Name</Label>
                    <Input
                      placeholder="Jane Doe"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      className="mt-1.5 bg-white/5 border-white/10 text-white"
                      required={formData.type === 'bank'}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Name</Label>
                    <Input
                      placeholder="HDFC Bank, SBI, etc."
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="mt-1.5 bg-white/5 border-white/10 text-white"
                      required={formData.type === 'bank'}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Number</Label>
                    <Input
                      placeholder="0000000000"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="mt-1.5 bg-white/5 border-white/10 text-white"
                      required={formData.type === 'bank'}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">IFSC Code</Label>
                    <Input
                      placeholder="HDFC0001234"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      className="mt-1.5 bg-white/5 border-white/10 text-white uppercase"
                      required={formData.type === 'bank'}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upi" className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">UPI ID</Label>
                  <Input
                    placeholder="user@bank"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="mt-1.5 bg-white/5 border-white/10 text-white"
                    required={formData.type === 'upi'}
                  />
                </div>
                <div className="rounded-xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center bg-white/5">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <QrCode className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">QR Code Upload (Optional)</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-primary hover:text-primary/80 hover:bg-primary/5">
                    Select File
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-white"
              />
              <Label htmlFor="isDefault" className="text-sm font-medium text-gray-300 cursor-pointer">
                Set as default payment method
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-6 text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-white border-0 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all duration-500 hover:scale-105"
            >
              Save Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
