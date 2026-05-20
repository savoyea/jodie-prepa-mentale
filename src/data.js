import { toLocalDateStr } from './utils.js';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';

export const DEFAULT_CONTENT = {
  siteName: "Jodie Peltier",
  tagline: "Préparation mentale",
  logo: '',
  logoFooter: '',
  favicon: '',
  heroImage: '',
  heroStyle: 'fullwidth',
  socialLinks: { facebook: '', instagram: '', youtube: '', twitter: '', linkedin: '' },
  heroTitle: "Deviens enfin\nvraiment toi",
  heroSubtitle: "Accompagnement en préparation mentale pour reconnecter à soi, gagner en confiance et avancer avec clarté.",
  heroQuote: "« Le mental ne se muscle pas dans l'urgence, il se cultive dans la patience. »",
  aboutPhoto: '',
  aboutShort: "Préparatrice mentale diplômée d'un Master EOPS (Entraînement et Optimisation de la Performance Sportive).",
  aboutTargets: ['Sportifs', 'Militaires', 'Professionnels', 'Particuliers'],
  aboutLong: "Dans l'optimisation de leurs performances. Mon approche repose sur des méthodes validées scientifiquement pour développer les habiletés mentales nécessaires à la progression et à l'atteinte des objectifs, tout en contribuant au développement et à l'épanouissement de l'individu. Je propose des séances en présentiel et en visio, pour un accompagnement flexible et personnalisé.",
  formations: [
    {
      id: 'f1',
      school: 'Nantes Université',
      diploma: 'Licence STAPS entraînement sportif spécialité natation (Nantes Université)',
      diplomaDetail: '',
      year: '2022',
      stages: 'L2 : Aquatic Sport Carquefou (natation)\nL3 : Saint-sébastien natation',
      image: '',
    },
    {
      id: 'f2',
      school: 'UBO (Université de Bretagne Occidentale)',
      diploma: 'Master EOPS parcours APIC',
      diplomaDetail: 'entraînement et optimisation de la performance sportive, parcours accompagnement de la performance individuelle et collective',
      year: '2025',
      stages: "M1 : Cercle des nageurs de Brest, Centre d'instruction naval de Brest (Marine Nationale)\nM2 : Groupement gymnique Havre et Banlieue",
      image: '',
    },
  ],
  memoires: [
    {
      id: 'm1',
      level: 'Master 1',
      title: 'Etude exploratoire des émotions et des stratégies de coping en situation de performance.',
      subtitle: "Le cas des mousses du centre d'instruction naval de Brest.",
    },
    {
      id: 'm2',
      level: 'Master 2',
      title: 'Carrière sportive, transitions et émotions chez des athlètes paralympiques français.',
      subtitle: "Étude des cours de vie d'athlètes ayant vécu une transition de la validité au handicap.",
    },
  ],
  whatIsTitle: "La préparation mentale, qu'est-ce que c'est ?",
  whatIsText: "La préparation mentale est un accompagnement qui vise à développer les ressources mentales et émotionnelles d'une personne pour qu'elle puisse atteindre ses objectifs, surmonter ses blocages et s'épanouir. Elle s'appuie sur des techniques validées scientifiquement : visualisation, respiration, gestion du stress, fixation d'objectifs, dialogue interne, routines de performance.",
  forWhomTitle: "Pour qui ?",
  forWhomItems: [
    { title: "Sportifs", text: "Amateurs ou compétiteurs, pour gérer la pression, optimiser la performance et préparer les échéances importantes." },
    { title: "Étudiants", text: "Pour aborder examens et concours avec confiance, gérer le stress et structurer le travail." },
    { title: "Particuliers", text: "Pour traverser une période de changement, reprendre confiance, ou retrouver du sens et de l'élan." },
    { title: "Entreprises", text: "Interventions de groupe pour cohésion d'équipe, gestion du stress et bien-être au travail." }
  ],
  ethicsImage: '',
  ethicsSchema: '',
  ethicsTitle: "La société française de psychologie du sport (SFPS)",
  ethicsText: "La SFPS a établi une charte éthique et de déontologie de la pratique, à laquelle ses membres s'engagent à adhérer. Cependant, qu'on en soit membre ou non, cette charte doit être respectée, et je m'engage personnellement à la respecter.",
  ethicsPrinciples: [
    { title: "Consentement", text: "Toute démarche d'accompagnement repose sur le consentement libre et éclairé de la personne." },
    { title: "Opérer dans l'intérêt de la personne", text: "L'accompagnement est centré sur le bien-être et les objectifs propres de chaque individu." },
    { title: "Secret professionnel", text: "Tout ce qui est partagé en séance reste strictement confidentiel. Aucune information n'est transmise sans accord explicite." },
    { title: "Compétence", text: "Une formation continue et l'orientation vers un professionnel adapté quand la situation dépasse mon champ d'intervention." },
    { title: "Respect", text: "Respect de la personne, de ses choix, de ses valeurs et de son intégrité physique et morale." },
  ],
  testimonials: [
    { id: 't1', name: 'Marie L.', role: 'Nageuse compétition', text: "Grâce à Jodie, j'ai appris à gérer mes émotions avant les compétitions. Ma progression mentale a été aussi importante que ma progression technique.", photo: '' },
    { id: 't2', name: 'Thomas R.', role: 'Militaire', text: "Les séances m'ont permis de développer une vraie résilience face à la pression. Des outils concrets et une écoute sincère.", photo: '' },
    { id: 't3', name: 'Sophie M.', role: 'Étudiante en médecine', text: "J'abordais mes concours avec beaucoup d'anxiété. Aujourd'hui j'arrive préparée mentalement, c'est un atout énorme.", photo: '' },
  ],
  googleApiKey: '',
  googlePlaceId: '',
  contactPhone: "07 83 15 70 30",
  contactEmail: "jodie.prepa.mentale@gmail.com",
  contactLocation: "Pays de la Loire — en présentiel ou en visio",
  legalMentions: `<h2>Mentions légales</h2><p>Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, les présentes mentions légales sont portées à la connaissance des utilisateurs et visiteurs du site.</p><h3>Éditeur du site</h3><p><strong>Jodie Peltier</strong> — Préparatrice mentale<br>Email : jodie.prepa.mentale@gmail.com<br>Téléphone : 07 83 15 70 30<br>Pays de la Loire — en présentiel ou en visio</p><h3>Hébergement</h3><p>Ce site est hébergé par GitHub Pages — 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis.</p><h3>Propriété intellectuelle</h3><p>L'ensemble du contenu de ce site (textes, images, logos) est protégé par le droit de la propriété intellectuelle et appartient à Jodie Peltier ou à ses ayants droit. Toute reproduction sans autorisation expresse est interdite.</p>`,
  legalCookies: `<h2>Politique en matière de cookies</h2><p>Ce site n'utilise pas de cookies de suivi ni de cookies publicitaires.</p><h3>Qu'est-ce qu'un cookie ?</h3><p>Un cookie est un petit fichier texte enregistré sur votre appareil lors de la visite d'un site web, permettant de mémoriser des informations entre deux visites.</p><h3>Cookies utilisés sur ce site</h3><p>Ce site utilise uniquement le stockage local du navigateur (<em>localStorage</em>) afin de mémoriser vos préférences de navigation (thème, langue, etc.). Aucun cookie tiers à des fins publicitaires ou analytiques n'est déposé.</p><h3>Gestion</h3><p>Vous pouvez supprimer ces données à tout moment en vidant le cache et les données de site dans les paramètres de votre navigateur.</p>`,
  legalPrivacy: `<h2>Politique de confidentialité</h2><p>La présente politique vous informe sur la manière dont vos données personnelles sont collectées et traitées, conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679).</p><h3>Responsable du traitement</h3><p><strong>Jodie Peltier</strong><br>Email : jodie.prepa.mentale@gmail.com<br>Téléphone : 07 83 15 70 30</p><h3>Données collectées</h3><p>Lors de l'utilisation du formulaire de contact ou du système de réservation, nous collectons : nom, prénom, adresse e-mail, numéro de téléphone et, le cas échéant, un message libre.</p><h3>Finalité du traitement</h3><p>Les données collectées sont utilisées uniquement pour répondre à vos demandes et assurer le suivi de l'accompagnement. Elles ne sont ni vendues ni transmises à des tiers.</p><h3>Durée de conservation</h3><p>Vos données sont conservées le temps nécessaire au traitement de votre demande, et au maximum 3 ans après le dernier contact.</p><h3>Vos droits</h3><p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez : jodie.prepa.mentale@gmail.com</p>`,
  legalTerms: `<h2>Conditions d'utilisation</h2><p>L'utilisation de ce site implique l'acceptation pleine et entière des présentes conditions.</p><h3>Accès au site</h3><p>L'accès au site est libre et gratuit. Jodie Peltier se réserve le droit de modifier, suspendre ou interrompre l'accès au site à tout moment et sans préavis.</p><h3>Responsabilité</h3><p>Les informations présentées sur ce site sont fournies à titre indicatif. La préparation mentale est un accompagnement complémentaire et ne se substitue pas à une prise en charge médicale ou psychothérapeutique.</p><h3>Propriété intellectuelle</h3><p>Tout contenu présent sur ce site (textes, images, structure) est protégé par le droit d'auteur. Toute reproduction totale ou partielle sans autorisation préalable est interdite.</p><h3>Droit applicable</h3><p>Les présentes conditions sont régies par le droit français. En cas de litige non résolu à l'amiable, les tribunaux français seront seuls compétents.</p>`,
};

export const DEFAULT_APP_SETTINGS = {
  testEmail: '',
  // Notification nouvelle réservation (envoyée à Jodie)
  notifSubject: "🔔 Nouvelle demande — {service}",
  notifTemplate: "Bonjour Jodie,\n\nTu as reçu une nouvelle demande de réservation.\n\nService : {service}\nDate : {date}\nHeure : {heure}\n\nClient :\nNom : {prenom} {nom}\nEmail : {email}\nTéléphone : {tel}\nMessage : {message}\n\nConnecte-toi au back-office pour confirmer ou annuler cette réservation.\n\nJodie Peltier — Préparation mentale",
  // Templates envoyés au client
  emailSubjectConfirm: "Confirmation de votre séance — {service}",
  emailTemplateConfirm: "Bonjour {prenom},\n\nVotre séance de {service} est confirmée pour le {date} à {heure}.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nÀ très bientôt,\nJodie",
  emailSubjectCancel: "Annulation de votre séance — {service}",
  emailTemplateCancel: "Bonjour {prenom},\n\nJe suis au regret de vous informer que votre séance de {service} prévue le {date} à {heure} est annulée.\n\nCordialement,\nJodie",
  emailSubjectDelete: "Votre réservation — {service}",
  emailTemplateDelete: "Bonjour {prenom},\n\nVotre réservation pour la séance de {service} a été supprimée de notre système.\n\nCordialement,\nJodie",
};

export const DEFAULT_SERVICES = [
  { id: 's1', name: "Appel découverte", duration: 30, price: 0, priceLabel: "Gratuit", description: "Un premier échange pour comprendre vos besoins, présenter ma méthode et voir si nous sommes alignés pour avancer ensemble.", color: "sage" },
  { id: 's2', name: "Séance individuelle", duration: 60, price: 55, priceLabel: "À partir de 55 €", description: "Accompagnement personnalisé en présentiel ou en visio. Objectifs précis, outils concrets, suivi sur mesure.", color: "terracotta" },
  { id: 's3', name: "Pack 5 séances", duration: 60, price: 250, priceLabel: "250 €", description: "Cinq séances individuelles à tarif préférentiel pour un accompagnement en profondeur sur un objectif structurant.", color: "ochre" },
  { id: 's4', name: "Intervention de groupe", duration: 90, price: 0, priceLabel: "Sur devis", surDevis: true, description: "Atelier collectif pour équipes, clubs sportifs ou établissements. Thématiques sur mesure.", color: "olive" },
];

export const generateDefaultSlots = () => {
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dow = date.getDay();
    if (dow === 0) continue;
    const dateStr = toLocalDateStr(date);
    const hours = dow === 6 ? ['09:00', '10:30'] : ['09:00', '10:30', '14:00', '15:30', '17:00'];
    hours.forEach(h => {
      slots.push({ id: `${dateStr}-${h}`, date: dateStr, time: h, duration: 60, available: true });
    });
  }
  return slots;
};

export const DEFAULT_BOOKINGS = [
  { id: 'b1', clientName: "Marie L.", clientEmail: "marie.l@example.com", clientPhone: "06 12 34 56 78", serviceId: 's2', date: "", time: "10:30", status: "confirmé", note: "Première séance — gestion du stress avant concours" },
];

export const storage = {
  async get(key, fallback) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', key)
          .maybeSingle();
        if (!error && data) return data.value;
      } catch {}
    }
    // Fallback localStorage
    try {
      const v = localStorage.getItem('jodie_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('settings')
          .upsert({ key, value }, { onConflict: 'key' });
      } catch {}
    }
    // Toujours écrire en localStorage comme cache local
    try { localStorage.setItem('jodie_' + key, JSON.stringify(value)); } catch {}
  }
};
