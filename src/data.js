import { toLocalDateStr } from './utils.js';

export const DEFAULT_CONTENT = {
  siteName: "Jodie Peltier",
  tagline: "Préparation mentale",
  logo: '',
  favicon: '',
  heroImage: '',
  heroStyle: 'split',
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
    },
    {
      id: 'f2',
      school: 'UBO (Université de Bretagne Occidentale)',
      diploma: 'Master EOPS parcours APIC',
      diplomaDetail: 'entraînement et optimisation de la performance sportive, parcours accompagnement de la performance individuelle et collective',
      year: '2025',
      stages: "M1 : Cercle des nageurs de Brest, Centre d'instruction naval de Brest (Marine Nationale)\nM2 : Groupement gymnique Havre et Banlieue",
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
  ethicsTitle: "Éthique et déontologie",
  ethicsText: "Mon accompagnement repose sur un cadre clair et respectueux. La préparation mentale n'est ni de la psychothérapie ni du coaching de vie : elle s'inscrit dans une démarche complémentaire et orientée vers l'objectif.",
  ethicsPrinciples: [
    { title: "Confidentialité", text: "Tout ce qui est partagé en séance reste strictement confidentiel. Aucune information n'est transmise sans accord explicite." },
    { title: "Bienveillance", text: "Un espace sans jugement, où chaque personne avance à son rythme et selon ses propres ressources." },
    { title: "Compétence", text: "Une formation continue et l'orientation vers un professionnel adapté quand la situation dépasse mon champ d'intervention." },
    { title: "Respect", text: "Respect de la personne, de ses choix, de ses valeurs et de son intégrité physique et morale." },
    { title: "Transparence", text: "Objectifs, méthodes, durée et tarifs sont clairement annoncés dès le premier échange." }
  ],
  contactPhone: "07 83 15 70 30",
  contactEmail: "jodie.prepa.mentale@gmail.com",
  contactLocation: "Pays de la Loire — en présentiel ou en visio",
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
    try {
      const v = localStorage.getItem('jodie_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    try { localStorage.setItem('jodie_' + key, JSON.stringify(value)); } catch {}
  }
};
