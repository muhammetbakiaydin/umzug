import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, SprayCan, Shield, Clock, Award, Star, Users, CheckCircle, ArrowRight, Sparkles, Phone, Mail, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

const LandingPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const services = [
    {
      icon: Package,
      title: t('services.moving'),
      description: 'Professional moving services for homes and offices with expert care',
      color: 'from-brand-primary to-[#d16635]',
      features: ['Expert Packing', 'Safe Transport', 'Full Insurance']
    },
    {
      icon: Truck,
      title: t('services.furniture'),
      description: 'Safe and reliable furniture transportation across Switzerland',
      color: 'from-brand-secondary to-[#0d1a2e]',
      features: ['Modern Fleet', 'GPS Tracking', 'Door-to-Door']
    },
    {
      icon: SprayCan,
      title: t('services.cleaning'),
      description: 'Professional cleaning services for move-in/out perfection',
      color: 'from-brand-primary to-[#d16635]',
      features: ['Deep Cleaning', 'Eco-Friendly', 'Quality Guarantee']
    },
  ]

  const features = [
    { icon: Shield, title: 'Fully Insured', description: 'Complete protection for your belongings' },
    { icon: Clock, title: '24/7 Support', description: 'Always here when you need us' },
    { icon: Award, title: '15+ Years', description: 'Trusted moving experience' },
    { icon: Users, title: '5000+ Customers', description: 'Happy clients nationwide' },
  ]

  const stats = [
    { number: '5000+', label: 'Happy Customers' },
    { number: '15+', label: 'Years Experience' },
    { number: '99%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' },
  ]

  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ku', name: 'Kurdî' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pt', name: 'Português' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Animated Background Circles */}
      <div className="blur-circle blur-circle-1 glow"></div>
      <div className="blur-circle blur-circle-2 glow" style={{ animationDelay: '1s' }}></div>
      <div className="blur-circle blur-circle-3 glow" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-brand-secondary/10 bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-[#d16635] rounded-xl flex items-center justify-center">
                <Truck className="w-7 h-7 text-brand-secondary" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">{t('common.company')}</h1>
            </div>
            <div className="flex gap-4 items-center">
              {/* Language Selector */}
              <select
                className="glass px-4 py-2 rounded-xl text-sm font-medium text-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white text-brand-secondary">
                    {lang.name}
                  </option>
                ))}
              </select>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/login')}
                className="glass border-brand-secondary/20 hover:bg-brand-primary/10 text-brand-secondary"
              >
                {t('nav.admin')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-secondary">Switzerland's #1 Moving Service</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-brand-secondary">
              Professional Moving
              <br />
              <span className="gradient-text">Made Simple</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Experience stress-free relocation with our expert team. Reliable, efficient, 
              and affordable moving solutions for your home or business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/offer')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-brand-primary to-[#d16635] hover:from-[#d16635] hover:to-[#c05f30] text-brand-secondary font-bold shadow-2xl hover-lift group"
              >
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 glass border-brand-secondary/20 hover:bg-brand-primary/10 text-brand-secondary"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card p-6 hover-lift">
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating" style={{ animationDelay: '0s' }}>
          <div className="w-20 h-20 bg-brand-primary/20 rounded-2xl blur-xl"></div>
        </div>
        <div className="absolute top-40 right-20 floating" style={{ animationDelay: '1s' }}>
          <div className="w-32 h-32 bg-blue-400/20 rounded-2xl blur-xl"></div>
        </div>
        <div className="absolute bottom-20 left-1/3 floating" style={{ animationDelay: '2s' }}>
          <div className="w-24 h-24 bg-green-400/20 rounded-2xl blur-xl"></div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive moving solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="glass-card border-white/10 hover-lift overflow-hidden group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-8 h-8 text-brand-secondary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Why <span className="gradient-text">Choose Us</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We deliver excellence in every move
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-8 text-center hover-lift group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-[#d16635]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-3xl p-12 md:p-20 text-center border border-brand-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-[#d16635]/5"></div>
            <div className="relative z-10">
              <h2 className="text-5xl font-bold mb-6 text-brand-secondary">
                Ready to <span className="text-brand-primary">Move</span>?
              </h2>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                Get your personalized quote in minutes. No hidden fees, just transparent pricing.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/offer')}
                className="text-lg px-10 py-6 bg-gradient-to-r from-brand-primary to-[#d16635] hover:from-[#d16635] hover:to-[#c05f30] text-slate-900 font-bold shadow-2xl hover-lift group"
              >
                <Star className="mr-2 w-5 h-5" />
                Get Your Free Quote Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-3xl p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Get In <span className="gradient-text">Touch</span>
                </h2>
                <p className="text-slate-600 mb-8">
                  Have questions? Our friendly team is here to help you 24/7.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Phone</div>
                      <div className="text-lg font-semibold">031 557 24 31</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Email</div>
                      <div className="text-lg font-semibold">info@gelbe-umzuege.ch</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Address</div>
                      <div className="text-lg font-semibold">Sandstrasse 5, 3322 Schönbühl</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass p-8 rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop" 
                  alt="Moving Team"
                  className="rounded-xl w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-[#d16635] rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand-secondary" />
            </div>
            <span className="font-bold gradient-text">Gelbe-Umzüge</span>
          </div>
          <p className="text-slate-600">&copy; 2025 Gelbe-Umzüge. All rights reserved.</p>
          <p className="text-sm text-slate-500 mt-2">Your trusted moving partner in Switzerland 🇨🇭</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
