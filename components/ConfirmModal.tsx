
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden relative"
                    >
                        <div className={`h-2 w-full ${type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />

                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-black text-gray-900 truncate uppercase tracking-tight">{title}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ação necessária</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {message}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3.5 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${type === 'danger' ? 'bg-red-500 shadow-red-200 hover:bg-red-600' : 'bg-amber-500 shadow-amber-200 hover:bg-amber-600'
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
