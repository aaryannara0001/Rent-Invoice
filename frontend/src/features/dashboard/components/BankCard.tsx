import React from 'react';
import { CreditCard, Landmark, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/useApp';
import { PaymentMethod } from '@/context/types';
import { motion } from 'framer-motion';

interface BankCardProps {
  method: PaymentMethod;
  onEdit?: (method: PaymentMethod) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  compact?: boolean;
}

export function BankCard({ method, onEdit, onDelete, onSetDefault, compact }: BankCardProps) {
  const isUPI = method.type === 'upi';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative active-card-border p-6 rounded-[2rem] border bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 ${
        method.isDefault ? 'border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/10'
      }`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-neon-purple/5 blur-3xl group-hover:bg-neon-purple/10 transition-colors duration-500" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${isUPI ? 'bg-neon-purple/20 text-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}>
              {isUPI ? <span className="text-xl font-bold">⚡</span> : <Landmark className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white transition-colors group-hover:text-primary">
                {method.label}
                {method.isDefault && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neon-green/10 px-2 py-0.5 text-[10px] font-medium text-neon-green shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="h-3 w-3" />
                    Default
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{isUPI ? 'UPI Payment' : method.bankName}</p>
            </div>
          </div>

          {!compact && (
            <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {!method.isDefault && onSetDefault && (
                <button
                  onClick={() => onSetDefault(method.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors"
                  title="Set as Default"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(method)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(method.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {isUPI ? (
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">UPI ID</p>
              <p className="mt-1 font-mono text-white group-hover:text-neon-purple transition-colors">{method.upiId}</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Account Number</p>
                <p className="mt-1 font-mono text-white group-hover:text-neon-blue transition-colors">
                  {method.accountNumber?.replace(/\d(?=\d{4})/g, '*')}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">IFSC Code</p>
                <p className="mt-1 font-mono text-white uppercase group-hover:text-neon-blue transition-colors">{method.ifscCode}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
