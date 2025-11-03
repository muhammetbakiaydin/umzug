import { FileText } from 'lucide-react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-primary" />
            <div>
              <h1 className="text-3xl font-bold text-brand-secondary">GELBE-UMZÜGE</h1>
              <p className="text-slate-600">Allgemeine Geschäftsbedingungen</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-8 space-y-8">
            
            {/* Versicherungen */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Versicherungen
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Gegen Verlust oder Beschädigung Ihrer Güter haften wir gemäss Schweizerischem Frachtvertragsgesetz (OF). 
                Wir machen Sie darauf aufmerksam, dass die Ware zum Zeitwert und nicht zum Neuwert versichert ist und zwar 
                bis zu einem Warenwert von CHF 1 Mio. Kontaktieren Sie uns bitte falls Sie das Transportgut oder einzelne 
                Gegenstände zu Neuwert speziell versichern möchten, wir informieren Sie gerne über die Ansätze.
              </p>
            </section>

            {/* Vorbereitung */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Vorbereitung
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Das Verpacken von kleineren Gegenständen wird durch den Kunden in Kartonschachteln bereitgestellt. 
                Grösseres Umzugsgut wie TV und Sofa wird durch die Firma Gelbe-Umzüge verpackt.
              </p>
            </section>

            {/* Verbrauchsmaterial */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Verbrauchsmaterial
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Umzugsdecken werden vor Ort gratis zur Verfügung gestellt, damit das Umzugsgut gut gesichert wird. 
                Verbrauchsmaterial wie Folien oder Bodenfliesen werden verrechnet, sowie das Depot für die Umzugskisten.
              </p>
            </section>

            {/* Pausen */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Pausen
              </h2>
              <div className="text-slate-700 leading-relaxed space-y-2">
                <p><strong>Vor- und Nachmittag:</strong> 15 Minuten</p>
                <p><strong>Mittagspause:</strong> 30 Minuten</p>
              </div>
            </section>

            {/* Information */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Information
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Die Offerte setzt voraus, dass beide Standorte frei zugänglich und über das schweizer Strassennetz 
                erreichbar sind. Ist der Lieferwert mit normalen Umzugswagen nicht oder nur erschwert zugänglich, 
                so erfolgt die Lieferung bis zur nächsten allgemein zugänglichen Stelle die ohne Zusatzaufwand oder 
                Zusatzkosten erreicht werden kann.
              </p>
            </section>

            {/* Schäden */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Schäden
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Schäden müssen gemäss OR Art.452 Absatz 1 sofort nach dem Umzug am Umzugsladearbeiter mitgeteilt und 
                schriftlich auf dem Schadenmeldungsformular mit dem Unterschrift des Kunden und des Umzugschefs festgehalten 
                werden. Schäden die nach dem Umzug können -abgesehen von dem im OR Art. 452 Absätze 2 und 3 erwähnten 
                äusserlich nicht erkennbaren Schäden mit einer Reklamationsfrist von 2 Tagen- nicht mehr berücksichtigt werden.
              </p>
            </section>

            {/* Zahlungsbedingungen */}
            <section>
              <h2 className="text-xl font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-primary rounded"></span>
                Zahlungsbedingungen
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Barzahlung am Abladeort nach dem Umzug an den Teamleiter. Dies betrifft den Betrag für den gesammten 
                Umzug und Reinigung.
              </p>
            </section>

            {/* Closing Note */}
            <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <p className="text-slate-700 leading-relaxed mb-4">
                Falls Ihnen unser Angebot zusagt, bitten wir Sie uns dieses umgehend unterschrieben zurück zu schicken, 
                damit wir den von Ihnen gewünschten Termin frühzeitig reservieren können.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Wir würden uns freuen, diesen Auftrag für Sie auszuführen und sichern Ihnen in jeder Beziehung eine 
                fachmännische und zuverlässigen Umzug zu. Falls Sie Fragen haben, stehen wir Ihnen gerne zur Verfügung.
              </p>
            </section>

            {/* Contact Information */}
            <section className="border-t border-slate-200 pt-6">
              <p className="text-slate-700 font-semibold mb-2">Freundliche Grüsse</p>
              <p className="text-slate-700 mb-4">Verkaufsleiter<br />Minerva Marco</p>
              
              <div className="bg-brand-secondary text-white p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Hauptsitz</h3>
                <p className="mb-2"><strong>Gelbe - Umzüge</strong></p>
                <p className="mb-1">Sandstrasse 5</p>
                <p className="mb-4">3322 Urtenen-Schönbühl</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Tel:</strong> 031 552 24 31 / 079 247 00 05</p>
                  <p><strong>E-Mail:</strong> info@gelbe-umzuege.ch</p>
                </div>
              </div>
            </section>

            {/* Agreement Statement */}
            <section className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg">
              <p className="text-slate-800 leading-relaxed font-medium">
                Hiermit erteile ich der Firma Gelbe-Umzüge den obgenannten Auftrag und bestätige, dieses Angebot gelesen 
                zu haben und mit allen Punkten einverstanden zu sein. Mit der Unterschrift bestätigen Sie, dass Sie mit 
                den AGB's und der Offerte einverstanden sind.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ort, Datum</label>
                  <div className="border-b-2 border-slate-300 h-10"></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Unterschrift</label>
                  <div className="border-b-2 border-slate-300 h-10"></div>
                </div>
              </div>
            </section>

            {/* Footer Contact */}
            <section className="text-center text-slate-600 text-sm border-t border-slate-200 pt-6">
              <p className="font-semibold text-brand-secondary mb-2">Gelbe - Umzüge</p>
              <p>Tel: 031 552 24 31 / 079 247 00 05</p>
              <p>E-Mail: info@gelbe-umzuege.ch</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
