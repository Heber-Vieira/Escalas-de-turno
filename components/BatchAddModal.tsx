
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Zap, Sparkles, AlertCircle, 
  Trash2, ClipboardList, Loader2,
  Settings, Upload, FileSpreadsheet, Layers,
  UserX
} from 'lucide-react';
import { UserConfig, ShiftType, WorkTurn, ThemeStyle } from '../types';
import { formatName } from '../utils/shiftCalculator';
import { GoogleGenAI, Type } from "@google/genai";
import { read, utils, writeFile } from 'xlsx';

interface BatchAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profiles: UserConfig[]) => void;
  existingRoles: string[];
  existingProfiles: UserConfig[];
}

export const BatchAddModal: React.FC<BatchAddModalProps> = ({ isOpen, onClose, onConfirm, existingRoles, existingProfiles }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewList, setPreviewList] = useState<Partial<UserConfig>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [defaultShift, setDefaultShift] = useState<ShiftType>(ShiftType.FIVE_TWO);
  const [defaultTurn, setDefaultTurn] = useState<WorkTurn>(WorkTurn.MORNING);

  // Mapeia nomes existentes para busca rápida O(1)
  const existingNamesSet = useMemo(() => 
    new Set(existingProfiles.map(p => p.name.trim().toLowerCase())),
    [existingProfiles]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = utils.sheet_to_json(ws) as any[];

        const formatDateForApp = (val: any) => {
          if (!val) return new Date().toISOString().split('T')[0];
          
          // Se for um objeto Date
          if (val instanceof Date && !isNaN(val.getTime())) {
            return val.toISOString().split('T')[0];
          }

          // Se for um número (data do Excel)
          if (typeof val === 'number') {
            // Excel counts days from 1900-01-01, but with a leap year bug.
            // (val - 25569) is the offset from Unix Epoch.
            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
            if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
          }

          if (typeof val !== 'string') return new Date().toISOString().split('T')[0];

          // Se já estiver no formato yyyy-mm-dd
          if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.split('T')[0];
          
          // Se estiver no formato dd/mm/yyyy
          if (/^\d{2}\/\d{2}\/\d{4}/.test(val)) {
            const parts = val.split(' ')[0].split('/');
            const [d, m, y] = parts;
            return `${y}-${m}-${d}`;
          }

          // Tentar parse genérico se nada funcionar
          const parsed = new Date(val);
          if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];

          return new Date().toISOString().split('T')[0];
        };

        const getShiftType = (val: any): ShiftType => {
          if (!val) return defaultShift;
          const strVal = String(val).trim().toLowerCase();
          // Mapeamento específico para lidar com variações comuns
          if (strVal === '5x2' || strVal.includes('5 x 2')) return ShiftType.FIVE_TWO;
          if (strVal === '6x1' || strVal.includes('6 x 1')) return ShiftType.SIX_ONE;
          if (strVal === '12x36' || strVal.includes('12 x 36')) return ShiftType.TWELVE_THIRTY_SIX;
          
          const match = Object.values(ShiftType).find(s => s.toLowerCase() === strVal);
          return (match as ShiftType) || defaultShift;
        };

        const getWorkTurn = (val: any): WorkTurn => {
          if (!val) return defaultTurn;
          const strVal = String(val).trim().toLowerCase();
          const match = Object.values(WorkTurn).find(t => t.toLowerCase() === strVal);
          return (match as WorkTurn) || defaultTurn;
        };

        const newMembers = data.map(row => ({
          id: Math.random().toString(36).substr(2, 9),
          name: formatName(String(row.Nome || row.nome || row.Name || row.name || 'Novo Integrante')),
          role: String(row.Cargo || row.cargo || row.Role || row.role || row.Função || row.funcao || 'Operador').trim(),
          shiftType: getShiftType(row.Escala || row.escala || row.Shift || row.shift),
          turn: getWorkTurn(row.Turno || row.turno || row.Turn || row.turn),
          startDate: formatDateForApp(row.Data_Inicio || row.data_inicio || row.StartDate || row.startDate),
          state: String(row.Estado || row.estado || row.State || row.state || 'SP').trim().toUpperCase(),
          city: String(row.Cidade || row.cidade || row.City || row.city || 'São Paulo').trim(),
          offDays: [0],
          rotatingWorkDays: 5,
          rotatingOffDays: 1,
          theme: ThemeStyle.MODERN
        }));
        setPreviewList(prev => [...prev, ...newMembers]);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setError('Erro ao ler arquivo Excel. Verifique o formato.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nome': 'Exemplo Silva',
        'Cargo': 'Analista',
        'Escala': '5x2',
        'Turno': 'Manhã',
        'Data_Inicio': '01/05/2024',
        'Estado': 'SP',
        'Cidade': 'São Paulo'
      }
    ];

    const ws = utils.json_to_sheet(templateData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Modelo");
    writeFile(wb, "modelo_escala.xlsx");
  };

  const handleAIParsing = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise o seguinte texto que contém uma lista de funcionários para escala de trabalho. 
        Extraia as informações estruturadas: nome, cargo, escala (5x2, 6x1, 12x36), turno (Manhã, Tarde, Noite), data de início (yyyy-MM-dd), estado (UF) e cidade.
        Se algum campo não for encontrado, tente inferir ou deixe conforme o padrão solicitado.
        Texto: "${inputText}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                shiftType: { type: Type.STRING, enum: Object.values(ShiftType) },
                turn: { type: Type.STRING, enum: Object.values(WorkTurn) },
                startDate: { type: Type.STRING },
                state: { type: Type.STRING },
                city: { type: Type.STRING }
              },
              required: ["name"]
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      const newMembers = result.map((item: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: formatName(item.name),
        role: item.role || 'Operador',
        shiftType: item.shiftType || defaultShift,
        turn: item.turn || defaultTurn,
        startDate: item.startDate || new Date().toISOString().split('T')[0],
        state: item.state || 'SP',
        city: item.city || 'São Paulo',
        offDays: [0],
        rotatingWorkDays: 5,
        rotatingOffDays: 1,
        theme: ThemeStyle.MODERN
      }));

      setPreviewList(prev => [...prev, ...newMembers]);
      setInputText('');
    } catch (err) {
      setError('A IA encontrou dificuldades ao processar. Tente um formato mais claro ou CSV.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePreviewField = (id: string, field: keyof UserConfig, value: any) => {
    setPreviewList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const duplicatesCount = useMemo(() => {
    return previewList.filter(p => p.name && existingNamesSet.has(p.name.trim().toLowerCase())).length;
  }, [previewList, existingNamesSet]);

  const handleConfirm = () => {
    // Filtra duplicados antes de enviar
    const cleanList = previewList.filter(p => p.name && !existingNamesSet.has(p.name.trim().toLowerCase()));
    if (cleanList.length === 0 && previewList.length > 0) {
      setError("Não há novos integrantes válidos para importar.");
      return;
    }
    onConfirm(cleanList as UserConfig[]);
    setPreviewList([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center px-4 pb-8">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div 
            initial={{ y: "100%", opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.98 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Layers size={24} className="text-pink-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">Massa de Dados</h2>
                  <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Processamento Inteligente</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-6 space-y-8">
                {/* Tabs */}
                <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
                  <button 
                    onClick={() => setActiveTab('paste')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'paste' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                  >
                    <ClipboardList size={14} /> Colar Texto
                  </button>
                  <button 
                    onClick={() => setActiveTab('file')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'file' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                  >
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                </div>

                {activeTab === 'paste' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Texto ou Tabela Copiada</span>
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg">
                        <Sparkles size={10} className="text-amber-500" />
                        <span className="text-[8px] font-black text-amber-600 uppercase">Gemini IA</span>
                      </div>
                    </div>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Cole os dados aqui... Ex:&#10;Marcio | RH | 5x2 | Manhã | 2024-05-01&#10;Ana | TI | 6x1 | Noite | 2024-05-02"
                      className="w-full h-32 p-5 bg-gray-50 border border-gray-100 rounded-[32px] text-xs font-bold focus:border-pink-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                    />
                    <button 
                      onClick={handleAIParsing}
                      disabled={!inputText.trim() || isProcessing}
                      className="w-full py-4 bg-gray-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95 transition-all"
                    >
                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="text-pink-500 fill-pink-500" />}
                      Processar com IA
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-4 border-dashed border-gray-100 rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 hover:border-pink-200 transition-all cursor-pointer bg-gray-50/50"
                    >
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg text-pink-500">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-gray-800">Selecione o arquivo Excel</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Formato suportado: .XLSX, .XLS</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadTemplate();
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-100 transition-all border border-pink-100"
                        >
                          <FileSpreadsheet size={14} />
                          Baixar Modelo
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                )}

                {/* Preview Section */}
                <AnimatePresence>
                  {previewList.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-pink-500" />
                          <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Revisar Integrantes ({previewList.length})</h3>
                        </div>
                        <button onClick={() => setPreviewList([])} className="text-[9px] font-black text-red-500 uppercase">Limpar Tudo</button>
                      </div>

                      {duplicatesCount > 0 && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ 
                            scale: [1, 1.02, 1],
                            opacity: 1 
                          }}
                          transition={{ 
                            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                          }}
                          className="p-4 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-3 text-red-600"
                        >
                          <UserX size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {duplicatesCount} Integrante(s) já cadastrado(s) - Serão ignorados!
                          </span>
                        </motion.div>
                      )}

                      <div className="space-y-3">
                        {previewList.map((p) => {
                          const isDuplicate = p.name && existingNamesSet.has(p.name.trim().toLowerCase());
                          return (
                            <motion.div 
                              key={p.id} 
                              animate={isDuplicate ? {
                                backgroundColor: ['#ffffff', '#fff1f2', '#ffffff'],
                                borderColor: ['#f3f4f6', '#fecaca', '#f3f4f6']
                              } : {}}
                              transition={isDuplicate ? { repeat: Infinity, duration: 1.2 } : {}}
                              className={`bg-white border rounded-[32px] p-5 shadow-sm space-y-4 relative overflow-hidden ${isDuplicate ? 'ring-2 ring-red-100' : 'border-gray-100'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${isDuplicate ? 'bg-red-500 text-white border-red-400' : 'bg-pink-50 text-pink-500 border-pink-100'}`}>
                                    {isDuplicate ? <AlertCircle size={14} /> : p.name?.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <input 
                                      value={p.name}
                                      onChange={(e) => updatePreviewField(p.id!, 'name', e.target.value)}
                                      placeholder="Nome"
                                      className={`w-full text-sm font-black bg-transparent outline-none focus:text-pink-500 ${isDuplicate ? 'text-red-500' : 'text-gray-900'}`}
                                    />
                                    {isDuplicate && <span className="text-[7px] font-black text-red-400 uppercase tracking-[0.2em] block -mt-1">Já existe no sistema</span>}
                                  </div>
                                </div>
                                <button onClick={() => setPreviewList(prev => prev.filter(item => item.id !== p.id))} className="p-2 text-gray-200 hover:text-red-500 transition-colors">
                                  <Trash2 size={18} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Cargo</label>
                                  <input 
                                    value={p.role}
                                    onChange={(e) => updatePreviewField(p.id!, 'role', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Escala</label>
                                  <select 
                                    value={p.shiftType}
                                    onChange={(e) => updatePreviewField(p.id!, 'shiftType', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none"
                                  >
                                    {Object.values(ShiftType).map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Turno</label>
                                  <select 
                                    value={p.turn}
                                    onChange={(e) => updatePreviewField(p.id!, 'turn', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none"
                                  >
                                    {Object.values(WorkTurn).map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Início</label>
                                  <input 
                                    type="date"
                                    value={p.startDate}
                                    onChange={(e) => updatePreviewField(p.id!, 'startDate', e.target.value)}
                                    className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-3xl flex items-center gap-2 text-[10px] font-bold uppercase">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-4 shrink-0">
              <button 
                onClick={onClose}
                className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                disabled={previewList.length === 0}
                className={`flex-[2] py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-20 ${duplicatesCount === previewList.length && previewList.length > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-pink-500 text-white shadow-pink-100 hover:shadow-pink-200'}`}
              >
                {duplicatesCount === previewList.length && previewList.length > 0 ? 'Nenhum Novo Integrante' : 'Importar Equipe'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
