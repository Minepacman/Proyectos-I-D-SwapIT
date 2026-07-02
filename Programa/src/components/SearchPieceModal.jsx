import { useState } from 'react'
import { Search, Zap, Bell, CheckCircle } from 'lucide-react'
import Modal from './Modal'
import { useApp } from '../context/AppContext'

const CATEGORIES = [
  { value: 'hw',   label: 'Hardware de computadora' },
  { value: 'comp', label: 'Equipos de cómputo'       },
  { value: 'elec', label: 'Componentes electrónicos' },
  { value: 'peri', label: 'Periféricos'               },
  { value: 'cable','label': 'Cables y conectores'    },
]

export default function SearchPieceModal() {
  const { searchPieceModalOpen, closeSearchPieceModal } = useApp()

  const [form, setForm] = useState({
    category: '',
    description: '',
    maxTokens: '',
    urgent: false,
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    closeSearchPieceModal()
    setTimeout(() => {
      setSuccess(false)
      setForm({ category: '', description: '', maxTokens: '', urgent: false })
      setErrors({})
    }, 300)
  }

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.category)           e.category = 'Selecciona una categoría'
    if (!form.description.trim()) e.description = 'Describe el componente que buscas'
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSuccess(true)
  }

  return (
    <Modal
      isOpen={searchPieceModalOpen}
      onClose={handleClose}
      title="Busco una pieza"
      subtitle="Registra qué hardware necesitas y te avisaremos cuando haya un match"
      size="md"
    >
      {success ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center
                          justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-brand-success"/>
          </div>
          <h3 className="font-bold text-brand-primary text-lg mb-2">Búsqueda registrada</h3>
          <p className="text-sm text-brand-muted mb-6">
            Te notificaremos por correo cuando aparezca una pieza compatible en la Bóveda.
          </p>
          <button onClick={handleClose} className="btn-primary max-w-xs mx-auto">
            Entendido
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200
                          rounded-xl p-3 mb-5">
            <Bell size={15} className="text-brand-secondary flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-brand-secondary leading-relaxed">
              El Motor de Match compara tu solicitud con las piezas disponibles.
              Si hay coincidencia inmediata, recibirás una propuesta al instante.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label">Categoría del componente *</label>
              <select
                name="category" value={form.category} onChange={handle}
                className={`field-input ${errors.category ? 'border-red-400 bg-red-50' : ''}`}
              >
                <option value="">Selecciona una categoría…</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="field-label">Descripción del componente *</label>
              <textarea
                name="description" value={form.description} onChange={handle}
                rows={3}
                placeholder="Modelo exacto, especificaciones, compatibilidad requerida…"
                className={`field-input resize-none ${errors.description ? 'border-red-400 bg-red-50' : ''}`}
              />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="field-label">Tokens máximos a pagar (opcional)</label>
              <div className="relative">
                <Zap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-token"/>
                <input
                  type="number" name="maxTokens"
                  value={form.maxTokens} onChange={handle}
                  placeholder="Ej: 500 (vacío = sin límite)"
                  min={0} max={10000}
                  className="field-input pl-10"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3
                               border border-brand-border rounded-xl hover:border-brand-secondary
                               hover:bg-blue-50/50 transition-all">
              <input
                type="checkbox" name="urgent"
                checked={form.urgent} onChange={handle}
                className="w-4 h-4 mt-0.5 rounded accent-brand-secondary flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-brand-primary">Búsqueda urgente</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  Prioriza tu solicitud y notifica a usuarios con piezas compatibles.
                </p>
              </div>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border-2 border-brand-border text-sm
                           font-semibold text-brand-muted hover:border-brand-primary
                           hover:text-brand-primary transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-brand-gradient text-white text-sm
                           font-semibold shadow-md hover:brightness-110
                           disabled:opacity-60 flex items-center justify-center gap-2
                           active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                ) : (
                  <><Search size={15}/> Registrar búsqueda</>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  )
}