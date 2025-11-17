import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { getOffer, supabase } from '@/lib/supabase'
import { Check, X, FileText, Calendar, MapPin, Mail, Phone, Pen } from 'lucide-react'
import { toast } from 'sonner'

const PublicOffer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [offer, setOffer] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasResponded, setHasResponded] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureData, setSignatureData] = useState(null)
  const canvasRef = useRef(null)
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toLocaleDateString('de-CH'))

  useEffect(() => {
    loadOffer()
  }, [id])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [])

  const loadOffer = async () => {
    setLoading(true)
    const { data, error } = await getOffer(id)
    
    if (error || !data) {
      toast.error('Angebot nicht gefunden')
      setLoading(false)
      return
    }

    // Check if already responded
    if (data.status === 'accepted' || data.status === 'declined') {
      setHasResponded(true)
    }

    setOffer(data)
    setLoading(false)
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    
    setIsDrawing(true)
    ctx.beginPath()
    const x = e.type.includes('mouse') ? e.clientX - rect.left : e.touches[0].clientX - rect.left
    const y = e.type.includes('mouse') ? e.clientY - rect.top : e.touches[0].clientY - rect.top
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    
    const x = e.type.includes('mouse') ? e.clientX - rect.left : e.touches[0].clientX - rect.left
    const y = e.type.includes('mouse') ? e.clientY - rect.top : e.touches[0].clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      const canvas = canvasRef.current
      setSignatureData(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }

  const handleResponse = async (response) => {
    if (hasResponded) return

    if (response === 'accepted' && !signatureData) {
      toast.error('Bitte unterschreiben Sie das Angebot')
      return
    }

    setSubmitting(true)
    try {
      const updateData = { 
        status: response,
        updated_at: new Date().toISOString()
      }

      if (response === 'accepted' && signatureData) {
        updateData.customer_signature = signatureData
        updateData.signature_location = location
        updateData.signature_date = date
      }

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      toast.success(
        response === 'accepted' 
          ? 'Angebot erfolgreich angenommen!' 
          : 'Angebot abgelehnt'
      )
      setHasResponded(true)
      setOffer({ ...offer, status: response })
    } catch (error) {
      toast.error('Fehler beim Senden der Antwort')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(value).replace('CHF', 'CHF ')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-900">Lädt Angebot...</div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Angebot nicht gefunden</div>
          <p className="text-slate-600">Der Link ist ungültig oder das Angebot wurde gelöscht.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg p-8 border-b-4 border-brand-primary">
          <div className="flex items-center justify-between mb-6">
            <img 
              src="/cropped-umzug-final.png" 
              alt="Umzug UNIT GmbH" 
              className="h-16"
            />
            <div className="text-right">
              <div className="text-sm text-slate-600">Offert Nr.</div>
              <div className="text-2xl font-bold text-slate-900">{offer.offer_number}</div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ihr Umzugsangebot</h1>
          <p className="text-slate-600">Vielen Dank für Ihre Anfrage. Hier ist unser Angebot für Ihren Umzug.</p>
        </div>

        {/* Status Banner */}
        {hasResponded && (
          <div className={`p-4 ${
            offer.status === 'accepted' 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            <div className="flex items-center gap-3">
              {offer.status === 'accepted' ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <X className="w-6 h-6 text-red-600" />
              )}
              <div>
                <div className={`font-semibold ${
                  offer.status === 'accepted' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {offer.status === 'accepted' 
                    ? 'Angebot angenommen' 
                    : 'Angebot abgelehnt'}
                </div>
                <div className={offer.status === 'accepted' ? 'text-green-700' : 'text-red-700'}>
                  {offer.status === 'accepted'
                    ? 'Vielen Dank! Wir werden uns in Kürze bei Ihnen melden.'
                    : 'Vielen Dank für Ihre Rückmeldung.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-b-xl shadow-lg p-8 space-y-6">
          {/* Customer Info */}
          <div className="border-b border-slate-200 pb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Kundeninformationen</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-brand-primary mt-1" />
                <div>
                  <div className="text-sm text-slate-600">Name</div>
                  <div className="font-medium text-slate-900">
                    {offer.from_first_name} {offer.from_last_name}
                  </div>
                </div>
              </div>
              {offer.from_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-primary mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">E-Mail</div>
                    <div className="font-medium text-slate-900">{offer.from_email}</div>
                  </div>
                </div>
              )}
              {offer.from_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-primary mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Telefon</div>
                    <div className="font-medium text-slate-900">{offer.from_phone}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand-primary mt-1" />
                <div>
                  <div className="text-sm text-slate-600">Umzugsdatum</div>
                  <div className="font-medium text-slate-900">{formatDate(offer.moving_date)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid md:grid-cols-2 gap-6 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <h3 className="font-semibold text-slate-900">Von</h3>
              </div>
              <div className="text-slate-700">
                <div>{offer.from_street}</div>
                <div>{offer.from_zip} {offer.from_city}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <h3 className="font-semibold text-slate-900">Nach</h3>
              </div>
              <div className="text-slate-700">
                <div>{offer.to_street}</div>
                <div>{offer.to_zip} {offer.to_city}</div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Preiskalkulation</h2>
            <div className="space-y-3">
              {offer.subtotal > 0 && (
                <div className="flex justify-between text-base">
                  <span className="text-slate-700">Zwischensumme:</span>
                  <span className="font-mono text-slate-900">{formatCurrency(offer.subtotal)}</span>
                </div>
              )}
              {offer.tax_rate > 0 && offer.tax_amount > 0 && (
                <div className="flex justify-between text-base">
                  <span className="text-slate-700">MwSt. ({offer.tax_rate}%):</span>
                  <span className="font-mono text-slate-900">{formatCurrency(offer.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-2xl text-slate-900 border-t-2 border-slate-300 pt-4 mt-4">
                <span>Total CHF:</span>
                <span className="font-mono text-brand-primary">{formatCurrency(offer.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {offer.notes && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Bemerkungen</h3>
              <div className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                {offer.notes}
              </div>
            </div>
          )}

          {/* Signature Section */}
          {!hasResponded && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Pen className="w-5 h-5 text-brand-primary" />
                Unterschrift
              </h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ort
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="z.B. Lyss"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Datum
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bitte unterschreiben Sie hier
                  </label>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="border-2 border-slate-300 rounded-lg w-full cursor-crosshair bg-white"
                      style={{ touchAction: 'none' }}
                    />
                    {signatureData && (
                      <button
                        onClick={clearSignature}
                        className="absolute top-2 right-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Unterschreiben Sie mit der Maus oder Ihrem Finger auf Touchscreens
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!hasResponded && (
            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleResponse('accepted')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                >
                  <Check className="mr-2 h-6 w-6" />
                  Angebot annehmen
                </Button>
                <Button
                  onClick={() => handleResponse('declined')}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 py-6 text-lg font-semibold"
                >
                  <X className="mr-2 h-6 w-6" />
                  Angebot ablehnen
                </Button>
              </div>
              <p className="text-center text-sm text-slate-600 mt-4">
                Durch das Annehmen des Angebots bestätigen Sie die oben genannten Konditionen.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <div className="mb-2">
            <strong>Umzug UNIT GmbH</strong> • Tulpenweg 22, 3250 Lyss
          </div>
          <div>
            Tel: 032 310 70 60 • Tel: 078 935 82 82 • info@umzug-unit.ch
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicOffer
