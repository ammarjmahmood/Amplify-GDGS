import React from 'react';
import { X, Trash2, Globe, Mic2, Shield, History } from 'lucide-react';

interface SettingsProps {
    onClose: () => void;
    sentenceHistory: string[];
    onClearHistory: () => void;
    dataSharing: boolean;
    onDataSharingChange: (enabled: boolean) => void;
    outputLanguage: string;
    onLanguageChange: (language: string) => void;
    selectedVoice: string;
    onVoiceChange: (voice: string) => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
];

const ELEVENLABS_VOICES = [
    { id: 'rachel', name: 'Rachel (Calm Female)' },
    { id: 'domi', name: 'Domi (Strong Female)' },
    { id: 'bella', name: 'Bella (Soft Female)' },
    { id: 'antoni', name: 'Antoni (Well-Rounded Male)' },
    { id: 'elli', name: 'Elli (Emotional Female)' },
    { id: 'josh', name: 'Josh (Deep Male)' },
    { id: 'arnold', name: 'Arnold (Crisp Male)' },
    { id: 'adam', name: 'Adam (Deep Male)' },
    { id: 'sam', name: 'Sam (Young Male)' },
];

export const Settings: React.FC<SettingsProps> = ({
    onClose,
    sentenceHistory,
    onClearHistory,
    dataSharing,
    onDataSharingChange,
    outputLanguage,
    onLanguageChange,
    selectedVoice,
    onVoiceChange,
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Sentence History */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <History className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sentence History</h3>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 max-h-64 overflow-y-auto">
                            {sentenceHistory.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 text-center py-8">No sentences generated yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {sentenceHistory.map((sentence, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white dark:bg-slate-700 p-3 rounded-xl text-slate-700 dark:text-slate-200"
                                        >
                                            {sentence}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {sentenceHistory.length > 0 && (
                            <button
                                onClick={onClearHistory}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl transition-colors font-bold"
                            >
                                <Trash2 size={18} />
                                Clear History
                            </button>
                        )}
                    </section>

                    {/* Data Sharing */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-green-600 dark:text-green-400" size={24} />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Privacy & Data Sharing</h3>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">Share usage data</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Help improve OMOI by sharing anonymous usage data
                                    </p>
                                </div>
                                <button
                                    onClick={() => onDataSharingChange(!dataSharing)}
                                    className={`relative w-14 h-8 rounded-full transition-colors ${dataSharing
                                        ? 'bg-green-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${dataSharing ? 'translate-x-6' : ''
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Output Language */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="text-blue-600 dark:text-blue-400" size={24} />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Output Language</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => onLanguageChange(lang.code)}
                                    className={`p-3 rounded-xl font-bold transition-all ${outputLanguage === lang.code
                                        ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ElevenLabs Voice */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Mic2 className="text-purple-600 dark:text-purple-400" size={24} />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Voice Selection</h3>
                        </div>
                        <div className="space-y-2">
                            {ELEVENLABS_VOICES.map((voice) => (
                                <button
                                    key={voice.id}
                                    onClick={() => onVoiceChange(voice.id)}
                                    className={`w-full p-4 rounded-xl font-bold text-left transition-all ${selectedVoice === voice.id
                                        ? 'bg-purple-500 text-white ring-4 ring-purple-200 dark:ring-purple-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {voice.name}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
