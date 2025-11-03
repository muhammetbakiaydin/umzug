import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources
const resources = {
  de: {
    translation: {
      // Common
      'common.company': 'Gelbe-Umzüge',
      'common.email': 'E-Mail',
      'common.phone': 'Telefon',
      'common.address': 'Adresse',
      'common.save': 'Speichern',
      'common.cancel': 'Abbrechen',
      'common.delete': 'Löschen',
      'common.edit': 'Bearbeiten',
      'common.view': 'Ansehen',
      'common.search': 'Suchen',
      'common.filter': 'Filtern',
      'common.loading': 'Laden...',
      'common.submit': 'Absenden',
      'common.back': 'Zurück',
      'common.next': 'Weiter',
      
      // Navigation
      'nav.home': 'Startseite',
      'nav.create_offer': 'Angebot erstellen',
      'nav.admin': 'Admin',
      'nav.dashboard': 'Dashboard',
      'nav.offers': 'Angebote',
      'nav.customers': 'Kunden',
      'nav.settings': 'Einstellungen',
      'nav.logout': 'Abmelden',
      
      // Services
      'services.moving': 'Umzug',
      'services.furniture': 'Möbeltransport',
      'services.cleaning': 'Reinigung',
      'services.disposal': 'Entsorgung',
      
      // Offer Form
      'offer.title': 'Angebot erstellen',
      'offer.customer_info': 'Kundeninformation',
      'offer.service_selection': 'Service-Auswahl',
      'offer.move_details': 'Umzugsdetails',
      'offer.additional_services': 'Zusatzleistungen',
      'offer.price_calculation': 'Preiskalkulation',
      'offer.first_name': 'Vorname',
      'offer.last_name': 'Nachname',
      'offer.from_address': 'Von Adresse',
      'offer.to_address': 'Zu Adresse',
      'offer.date': 'Datum',
      'offer.time': 'Uhrzeit',
      'offer.floor': 'Stockwerk',
      'offer.elevator': 'Aufzug',
      'offer.success': 'Angebot erfolgreich erstellt!',
      
      // Auth
      'auth.login': 'Anmelden',
      'auth.logout': 'Abmelden',
      'auth.password': 'Passwort',
      'auth.forgot_password': 'Passwort vergessen?',
      'auth.reset_password': 'Passwort zurücksetzen',
      'auth.sign_in': 'Einloggen',
    }
  },
  en: {
    translation: {
      'common.company': 'Gelbe-Umzüge',
      'common.email': 'Email',
      'common.phone': 'Phone',
      'common.address': 'Address',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.loading': 'Loading...',
      'common.submit': 'Submit',
      'common.back': 'Back',
      'common.next': 'Next',
      
      'nav.home': 'Home',
      'nav.create_offer': 'Create Offer',
      'nav.admin': 'Admin',
      'nav.dashboard': 'Dashboard',
      'nav.offers': 'Offers',
      'nav.customers': 'Customers',
      'nav.settings': 'Settings',
      'nav.logout': 'Logout',
      
      'services.moving': 'Moving',
      'services.furniture': 'Furniture Transport',
      'services.cleaning': 'Cleaning',
      'services.disposal': 'Disposal',
      
      'offer.title': 'Create Offer',
      'offer.customer_info': 'Customer Information',
      'offer.service_selection': 'Service Selection',
      'offer.move_details': 'Move Details',
      'offer.additional_services': 'Additional Services',
      'offer.price_calculation': 'Price Calculation',
      'offer.first_name': 'First Name',
      'offer.last_name': 'Last Name',
      'offer.from_address': 'From Address',
      'offer.to_address': 'To Address',
      'offer.date': 'Date',
      'offer.time': 'Time',
      'offer.floor': 'Floor',
      'offer.elevator': 'Elevator',
      'offer.success': 'Offer created successfully!',
      
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.password': 'Password',
      'auth.forgot_password': 'Forgot Password?',
      'auth.reset_password': 'Reset Password',
      'auth.sign_in': 'Sign In',
    }
  },
  fr: {
    translation: {
      'common.company': 'Gelbe-Umzüge',
      'common.email': 'Email',
      'common.phone': 'Téléphone',
      'common.address': 'Adresse',
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.view': 'Voir',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.loading': 'Chargement...',
      'common.submit': 'Soumettre',
      'common.back': 'Retour',
      'common.next': 'Suivant',
      
      'nav.home': 'Accueil',
      'nav.create_offer': 'Créer une offre',
      'nav.admin': 'Admin',
      'nav.dashboard': 'Tableau de bord',
      'nav.offers': 'Offres',
      'nav.customers': 'Clients',
      'nav.settings': 'Paramètres',
      'nav.logout': 'Déconnexion',
      
      'services.moving': 'Déménagement',
      'services.furniture': 'Transport de meubles',
      'services.cleaning': 'Nettoyage',
      'services.disposal': 'Élimination',
      
      'offer.title': 'Créer une offre',
      'offer.customer_info': 'Informations client',
      'offer.service_selection': 'Sélection du service',
      'offer.move_details': 'Détails du déménagement',
      'offer.additional_services': 'Services supplémentaires',
      'offer.price_calculation': 'Calcul du prix',
      'offer.first_name': 'Prénom',
      'offer.last_name': 'Nom',
      'offer.from_address': 'De l\'adresse',
      'offer.to_address': 'À l\'adresse',
      'offer.date': 'Date',
      'offer.time': 'Heure',
      'offer.floor': 'Étage',
      'offer.elevator': 'Ascenseur',
      'offer.success': 'Offre créée avec succès!',
      
      'auth.login': 'Connexion',
      'auth.logout': 'Déconnexion',
      'auth.password': 'Mot de passe',
      'auth.forgot_password': 'Mot de passe oublié?',
      'auth.reset_password': 'Réinitialiser le mot de passe',
      'auth.sign_in': 'Se connecter',
    }
  },
  // Add other languages here (it, tr, ar, es, fa, ku, nl, pt)
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    supportedLngs: ['de', 'en', 'fr', 'it', 'tr', 'ar', 'es', 'fa', 'ku', 'nl', 'pt'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
