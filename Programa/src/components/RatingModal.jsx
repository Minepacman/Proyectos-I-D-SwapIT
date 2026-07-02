import { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import Modal from './Modal'
import { useApp } from '../context/AppContext'

export default function RatingModal() {
  const { ratingModal, closeRatingModal, showToast } = useApp()
  const { isOpen, userName, matchId } = ratingModal

  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleClose = () => {
    closeRatingModal()
    setTimeout(() => {
      setRating(0)
      setComment('')
      setDone(false)
    }, 300)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    showToast(`Calificación enviada a ${userName}`)
    setDone(true)
    setLoading(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Calificar intercambio"
      subtitle={userName ? `¿Cómo fue tu experiencia con ${userName}?` : undefined}
      size="sm"
    >
      {done ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center
                          justify-center mx-auto mb-3">
            <CheckCircle size={28} className="text-brand-success"/>
          </div>
          <p className="font-semibold text-brand-primary mb-1">¡Gracias por tu calificación!</p>
          <p className="text-sm text-brand-muted mb-5">
            Tu opinión ayuda a mantener la confianza en la comunidad SwapIT.
          </p>
          <button onClick={handleClose} className="btn-primary max-w-xs mx-auto">
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    n <= (hover || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-brand-border'
                  }
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-brand-muted">
            {rating === 0 ? 'Selecciona una calificación' :
             rating >= 4 ? '¡Excelente experiencia!' :
             rating >= 3 ? 'Buena experiencia' : 'Experiencia mejorable'}
          </p>

          <div>
            <label className="field-label">Comentario (opcional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="¿Cómo fue la entrega, el estado de la pieza, la comunicación…?"
              className="field-input resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!rating || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : 'Enviar calificación'}
          </button>
        </form>
      )}
    </Modal>
  )
}