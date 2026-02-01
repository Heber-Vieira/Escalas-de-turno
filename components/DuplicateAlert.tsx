
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserX, X } from 'lucide-react';

interface DuplicateAlertProps {
    duplicateErrorName: string | null;
    setDuplicateErrorName: (name: string | null) => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
    duplicateErrorName,
    setDuplicateErrorName
}) => {
    return (
        <AnimatePresence>
            {duplicateErrorName && (
                <div className="fixed inset-x-0 top-0 z-[99999] pointer-events-none flex justify-center px-4">
                    <motion.div
                        initial={{ y: -120, opacity: 0, scale: 0.8 }}
                        animate={{
                            y: 16,
                            opacity: 1,
                            scale: [1, 1.02, 1],
                            backgroundColor: ['#ef4444', '#dc2626', '#ef4444']
                        }}
                        exit={{ y: -120, opacity: 0, scale: 0.8 }}
                        transition={{
                            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                            backgroundColor: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                            y: { type: "spring", stiffness: 400, damping: 25 }
                        }}
                        className="pointer-events-auto w-full max-w-[92vw] sm:max-w-sm px-4 py-3 sm:px-6 sm:py-4 rounded-[24px] sm:rounded-[28px] shadow-[0_20px_60px_rgba(239,68,68,0.4)] flex items-center gap-3 sm:gap-4 text-white border border-white/20 backdrop-blur-md"
                    >
                        <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl shrink-0">
                            <UserX size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-80 leading-none mb-0.5 sm:mb-1">
                                Bloqueio de Duplicidade
                            </h4>
                            <p className="text-[11px] sm:text-[14px] font-black leading-tight truncate">
                                "{duplicateErrorName}" já cadastrado!
                            </p>
                        </div>
                        <button
                            onClick={() => setDuplicateErrorName(null)}
                            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-90 shrink-0"
                        >
                            <X size={16} className="sm:w-5 sm:h-5" strokeWidth={3} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
