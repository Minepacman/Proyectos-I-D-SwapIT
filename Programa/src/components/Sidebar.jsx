import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FILTER_SECTIONS = [
  {
    key: 'availability',
    label: 'Disponibilidad',
    options: ['Disponible (12)', 'En Proceso (3)', 'Todos'],
  },
  {
    key: 'category',
    label: 'Categoría',
    options: ['Equipos de cómputo', 'Hardware', 'Componentes electrónicos', 'Periféricos', 'Cables'],
  },
  {
    key: 'condition',
    label: 'Estado físico',
    options: ['Excelente (8-10)', 'Bueno (5-7)', 'Regular (3-4)', 'Todos'],
  },
  {
    key: 'tokenRange',
    label: 'Rango de Tokens',
    options: ['0–500', '500–2000', '2000–5000', '5000+'],
  },
  {
    key: 'tags',
    label: 'Etiquetas',
    options: ['CPUs', 'Tarjetas gráficas', 'RAM', 'SSD/HDD', 'Arduino/Pi', 'Laptops'],
  },
]

export default function Sidebar({ filters, onChange }) {
  const [open, setOpen] = useState({
    availability: true,
    category: true,
    condition: false,
    tokenRange: false,
    tags: false,
  })

  const toggle = (key) => setOpen(o => ({ ...o, [key]: !o[key] }))

  const handleCheck = (section, value) => {
    const prev = filters[section] ?? []
    const next = prev.includes(value)
      ? prev.filter(v => v !== value)
      : [...prev, value]
    onChange({ ...filters, [section]: next })
  }

  return (
    <aside className="w-full">
      <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">
        Filtros
      </h3>

      <div className="space-y-1">
        {FILTER_SECTIONS.map(({ key, label, options }) => (
          <div key={key} className="border-b border-brand-border/50 pb-1">
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between py-3 text-sm
                         font-semibold text-brand-primary hover:text-brand-secondary
                         transition-colors"
            >
              {label}
              {open[key]
                ? <ChevronUp size={15} className="text-brand-muted" />
                : <ChevronDown size={15} className="text-brand-muted" />
              }
            </button>

            {open[key] && (
              <div className="pb-3 space-y-2">
                {options.map(opt => {
                  const checked = (filters[key] ?? []).includes(opt)
                  return (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => handleCheck(key, opt)}
                        className={`w-4 h-4 rounded flex items-center justify-center border
                                    transition-all duration-150 flex-shrink-0
                                    ${checked
                                      ? 'bg-brand-secondary border-brand-secondary'
                                      : 'border-brand-border group-hover:border-brand-secondary bg-white'}`}
                      >
                        {checked && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3L3.5 5.5L8 1" stroke="white" strokeWidth="1.5"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm transition-colors
                        ${checked ? 'text-brand-primary font-medium' : 'text-brand-muted group-hover:text-brand-primary'}`}>
                        {opt}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clear filters */}
      {Object.values(filters).some(v => v?.length > 0) && (
        <button
          onClick={() => onChange({})}
          className="mt-4 text-xs font-semibold text-brand-danger hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  )
}
