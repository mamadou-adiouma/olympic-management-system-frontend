import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div className={`fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white transition-all z-50 ${isSuccess ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
            {isSuccess ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}