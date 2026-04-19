import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { Plus, Landmark, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BankCard } from '@/features/dashboard/components/BankCard';
import { AddBankModal } from '@/features/dashboard/components/AddBankModal';
import { PaymentMethod } from '@/context/types';
import { motion, AnimatePresence } from 'framer-motion';

const BankDetails: React.FC = () => {
  const { 
    paymentMethods, 
    addPaymentMethod, 
    updatePaymentMethod, 
    deletePaymentMethod, 
    setDefaultPaymentMethod,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const handleAddClick = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleSave = (method: PaymentMethod) => {
    if (editingMethod) {
      updatePaymentMethod(method.id, method);
    } else {
      addPaymentMethod(method);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Landmark className="h-10 md:h-12 w-10 md:w-12 text-blue-500" />
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter gradient-text">
                Bank Details
              </h1>
            </div>
            <p className="text-muted-foreground text-lg font-medium flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-neon-green" />
              Manage your payment methods for invoices and receipts
            </p>
          </div>
          <Button 
            onClick={handleAddClick}
            className="rounded-2xl h-14 px-8 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-white border-0 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all duration-500 hover:scale-105 group font-bold text-lg"
          >
            <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
            Add Account
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-2xl p-4 flex items-center gap-4 text-sm text-neon-blue backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>The account marked as <strong>Default</strong> will be automatically selected for all new invoices. You can still change it during invoice creation.</p>
        </div>

        {/* Grid Section */}
        {paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <AnimatePresence mode="popLayout">
              {paymentMethods.map((method) => (
                <BankCard
                  key={method.id}
                  method={method}
                  onEdit={handleEditClick}
                  onDelete={deletePaymentMethod}
                  onSetDefault={setDefaultPaymentMethod}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 rounded-[3rem] border border-dashed border-white/10 bg-white/5 space-y-6 text-center"
          >
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
                <div className="absolute inset-0 rounded-full animate-pulse-glow" />
                <Landmark className="h-16 w-16 text-primary animate-bounce-slow" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold text-white">No payment methods yet</h3>
              <p className="text-muted-foreground">Add your bank account or UPI details to start receiving payments professionally.</p>
            </div>
            <Button 
                onClick={handleAddClick}
                variant="outline" 
                className="mt-4 border-primary/20 hover:bg-primary/5 text-primary rounded-xl px-8 h-12"
            >
              <Plus className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </motion.div>
        )}
      </div>

      <AddBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingMethod={editingMethod}
      />
    </MainLayout>
  );
};

export default BankDetails;
