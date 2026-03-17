import React, { useState } from 'react';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function ReportModal({ isOpen, onClose, userId }: ReportModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { error: supabaseError } = await supabase
        .from('reports')
        .insert({
          user_id: userId || null,
          message: message.trim(),
        });

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Report error:', err);
      setError('Hata bildirimi gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#0A0A0A] border border-blue-500/20 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold text-white">Hata Bildir</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {success ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                    <Send size={24} />
                  </div>
                  <p className="text-green-400 font-medium">Bildiriminiz başarıyla gönderildi!</p>
                  <p className="text-zinc-500 text-sm">Geri bildiriminiz için teşekkür ederiz.</p>
                </motion.div>
              ) : (
                <>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Karşılaştığınız hatayı veya geliştirilmesini istediğiniz özelliği aşağıya yazabilirsiniz.
                  </p>
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <textarea
                    autoFocus
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hata açıklaması..."
                    className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white text-sm transition-all resize-none placeholder:text-zinc-600"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Gönder
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
