/**
 * Arbre de dialogues et narration de "L'Impasse de l'Habitat Thulé-7"
 * Ambiance cRPG rétro-futuriste Hard SF (Fallout 1 & 2 / The Expanse)
 */

import { DialogueNode } from '../types/game';

export const DIALOGUE_NODES: Record<string, DialogueNode> = {
  // --- SCÈNE D'OUVERTURE ---
  start: {
    id: 'start',
    speaker: 'Système HUD Mutuelle',
    faction: 'Système',
    text: `[DÉPRESSURISATION PARTIELLE DÉTECTÉE - HABITAT THULÉ-7]
Température ambiante : -50.4°C. Pression : 72 kPa. Microgravité : 0.04 g.
Atmosphère raréfiée chargée de cristaux de glace en suspension.

Vous franchissez le sas d'amarrage principal. Le halo stroboscopique orange d'urgence découpe trois silhouettes pétrifiées. Elles se tiennent en joue à bout portant avec des pistolets de bord chargés de munitions frangibles.

Au centre, Lina Kovalenko, technicienne de la Mutuelle, s'accroche d'une main à un conteneur cryogénique lourd estampillé [SEREGUINE-COMET / ÉCHANTILLONS VOLATILS]. Son flanc gauche pisse une vapeur rougeâtre : une perforation de combinaison non colmatée.
À deux mètres d'elle sur la passerelle, Kael Darrow, inspecteur de l'Office de la Veille en armure de pont rigide, braque son arme de service :
« Restez immobile, Kovalenko ! Le protocole 44-B de la Veille impose la mise sous séquestre immédiate de ce conteneur pour risque biologique majeur ! »
Dans l'ombre du pupitre de survie, Dimitri Voronov, l'agent infiltré du Kombinat Hélion, ricane doucement, son pistolet 10mm pointé sur le plexus de Kael :
« Ferme-la, bureaucrate. Ce conteneur vaut quarante millions de crédits sur Titan. Personne ne sortira vivant d'ici sans mon accord. »

À votre arrivée, trois paires d'yeux terrorisés et armés se braquent brutalement sur vous.`,
    choices: [
      {
        id: 'c_survie',
        text: '[Systèmes de survie] « Regardez vos consoles, abrutis ! La température est à -50°C et descend ! Dans quelques minutes nos combinaisons gèlent et on crève tous ensemble ! »',
        skillReq: {
          skillId: 'systemes_survie',
          skillName: 'Systèmes de survie',
          targetScore: 65,
          difficultyMod: 0,
        },
        nextId: 'check_survie',
      },
      {
        id: 'c_medecine',
        text: '[Premiers secours] « Lina ! Ta combinaison perd sa pression au flanc gauche. Si tu ne me laisses pas poser une rustine et un hémostatique maintenant, tu es morte dans trois minutes ! »',
        skillReq: {
          skillId: 'premiers_secours',
          skillName: 'Premiers secours',
          targetScore: 55,
          difficultyMod: 10,
        },
        nextId: 'check_medecine',
      },
      {
        id: 'c_intimidation',
        text: '[Intimidation] « Baissez vos armes immédiatement. Je suis le seul Sauveteur assermenté avec un sas d\'évacuation fonctionnel. Si un tir part, je reverrouille la trappe et je vous laisse pourrir dans la glace. »',
        skillReq: {
          skillId: 'intimidation',
          skillName: 'Intimidation',
          targetScore: 55,
          difficultyMod: -10,
        },
        nextId: 'check_intimidation',
      },
      {
        id: 'c_observation',
        text: '[Vigilance] Observer calmement les positions, les mains tremblantes et le bornier électrique derrière Voronov.',
        skillReq: {
          skillId: 'vigilance',
          skillName: 'Vigilance',
          targetScore: 55,
          difficultyMod: 10,
        },
        nextId: 'check_vigilance',
      },
      {
        id: 'c_combat_direct',
        text: '[Combat] Dégainer votre arme de poing 9mm et vous abriter derrière le montant du sas !',
        nextId: 'combat_escalation',
      },
    ],
  },

  // --- BRANCHES DE TESTS DE COMPÉTENCES ---

  // SURVIE REUSSIE
  survie_success: {
    id: 'survie_success',
    speaker: 'Inspecteur Kael & Voronov',
    text: `Kael jette un œil nerveux au manomètre de son poignet. Le chiffre rouge clignote : -51.2°C. L'ammoniac du circuit caloporteur s'est figé.
« Il a raison... marmonne Kael, la voix altérée par le haut-parleur de son casque. Si le réchauffeur de sas ne redémarre pas, nos batteries vont entrer en hypothermie critique. »

Voronov ne baisse pas son flingue, mais son doigt se détend d'un millimètre sur la détente.
« Alors répare-le, Sauveteur. Mais personne ne touche au conteneur tant que je n'ai pas un code de déverrouillage sécurisé. Lina, donne-moi le cylindre cryo ! »

Lina gémit, serrant les dents contre la douleur :
« Jamais... La Mutuelle a perdu six mineurs pour sonder ce noyau cométaire. Hélion veut juste monopoliser les catalyseurs de fusion organique... »`,
    choices: [
      {
        id: 'c_reparer_urgence',
        text: '[Électronique] « Je vais ouvrir le panneau thermique et forcer la boucle de chauffe d\'urgence. Personne ne tire. »',
        skillReq: {
          skillId: 'electronique',
          skillName: 'Électronique',
          targetScore: 60,
          difficultyMod: 0,
        },
        nextId: 'check_reparation',
      },
      {
        id: 'c_soigner_lina_trêve',
        text: '« Lina, laisse-moi te poser cette rustine. Kael, Voronov, vous bougez, vous mourez. »',
        nextId: 'soigner_lina_interaction',
      },
      {
        id: 'c_negocier_kael',
        text: '[Bureaucratie et droit] « Inspecteur Darrow. La Veille peut-elle garantir le rapatriement médical de Lina si le conteneur est consigné sous scellé conjoint ? »',
        skillReq: {
          skillId: 'bureaucratie_droit',
          skillName: 'Bureaucratie et droit',
          targetScore: 45,
          difficultyMod: 10,
        },
        nextId: 'check_droit_kael',
      },
      {
        id: 'c_deal_voronov',
        text: '[Négociation] (À Voronov) « Si Hélion veut ce conteneur, quelle est la part de la Mutuelle et mon dédommagement ? »',
        skillReq: {
          skillId: 'negociation',
          skillName: 'Négociation',
          targetScore: 50,
          difficultyMod: 0,
        },
        nextId: 'check_deal_voronov',
      },
    ],
  },

  survie_fail: {
    id: 'survie_fail',
    speaker: 'Dimitri Voronov',
    faction: 'Kombinat',
    text: `Voronov hausse les épaules avec un rictus de prédateur :
« Belle tentative de diversion, Sauveteur ! Ma combinaison thermo-isolante de Titan tient jusqu'à -140°C. Vous mourrez bien avant moi. Vous me prenez pour un bleu de station orbitale ? Recule ou je te troue le caisson ! »
La tension monte d'un cran. Kael pointe son arme alternativement vers vous et Voronov.`,
    choices: [
      {
        id: 'c_fail_to_intim',
        text: '[Intimidation] « Tu ne sais pas à qui tu parles, Voronov. Tu crois que la Mutuelle envoie des diplomates sur un habitat fantôme ? »',
        skillReq: {
          skillId: 'intimidation',
          skillName: 'Intimidation',
          targetScore: 55,
          difficultyMod: -10,
        },
        nextId: 'check_intimidation',
      },
      {
        id: 'c_fail_to_combat',
        text: '[Combat] La parole est inutile. Faire feu sur Voronov avant qu\'il n\'aligne votre visière !',
        nextId: 'combat_escalation',
      },
    ],
  },

  // MEDECINE REUSSIE
  medecine_success: {
    id: 'medecine_success',
    speaker: 'Lina Kovalenko',
    faction: 'Mutuelle',
    text: `Lina baisse un instant son pistolet à aiguilles. La respiration dans sa radio est rauque, haletante.
« Vaelen... c'est toi ? Dieu merci... La Mutuelle a envoyé quelqu'un... J'ai... j'ai un éclat de carotte de forage dans la cuisse et le flanc. La dépression commence à faire bouillir ma sueur... »

Kael fait un pas en avant, la voix solennelle :
« Sauveteur, autorisez la prise en charge médicale. Mais la Veille réquisitionne la cargaison. Ces glaces cométaires renferment des hydrocarbures prébiotiques non catalogués. Tout contact avec l'atmosphère d'un habitat habité pourrait déclencher une nécrose cellulaire foudroyante ! »

Voronov crache par terre à travers sa valve :
« Des conneries pour justifier vos monopoles de la Terre ! Ce sont les catalyseurs de fusion les plus purs découverts depuis cinquante ans ! »`,
    choices: [
      {
        id: 'c_appliquer_soins',
        text: 'Poser immédiatement une rustine pneumatique sur la combinaison de Lina et lui injecter le bio-coagulant.',
        nextId: 'lina_sauvee_dialogue',
      },
      {
        id: 'c_psy_voronov',
        text: '[Psychologie] « Voronov, vous tremblez. Votre navette de récupération ne viendra jamais. Vous avez tué les mineurs de Thulé-7, n\'est-ce pas ? »',
        skillReq: {
          skillId: 'psychologie',
          skillName: 'Psychologie',
          targetScore: 50,
          difficultyMod: 0,
        },
        nextId: 'check_psy_voronov',
      },
      {
        id: 'c_arbitrage_kael',
        text: '[Bureaucratie et droit] « Darrow, si Lina survit, elle a le statut de témoin protégé selon l\'article 12 du Code Cérèsien. Baisse ton arme. »',
        skillReq: {
          skillId: 'bureaucratie_droit',
          skillName: 'Bureaucratie et droit',
          targetScore: 45,
          difficultyMod: 10,
        },
        nextId: 'check_droit_kael',
      },
    ],
  },

  medecine_fail: {
    id: 'medecine_fail',
    speaker: 'Lina Kovalenko',
    faction: 'Mutuelle',
    text: `« Ne t'approche pas ! » hurle Lina, les yeux fous de douleur et d'hypoxie. Elle lève son pistolet à aiguilles en direction de votre torse.
« Tout le monde veut ce conteneur ! Les gars de l'équipe de forage sont déjà morts asphyxiés dans la galerie B ! Vous êtes tous des charognards ! »
La panique est contagieuse. Kael resserre son emprise sur son arme.`,
    choices: [
      {
        id: 'c_calmer_lina',
        text: '[Persuasion] « Lina, je suis Vaelen, de la station Pallas ! Regarde l\'insigne du syndicat sur mon épaule ! Je suis venu te sortir de là ! »',
        skillReq: {
          skillId: 'persuasion',
          skillName: 'Persuasion',
          targetScore: 50,
          difficultyMod: 10,
        },
        nextId: 'check_persuasion_lina',
      },
      {
        id: 'c_combat_panique',
        text: '[Combat] Trop tard pour négocier. Tirer pour désarmer Voronov pendant qu\'il regarde Lina !',
        nextId: 'combat_escalation',
      },
    ],
  },

  // INTIMIDATION REUSSIE
  intimidation_success: {
    id: 'intimidation_success',
    speaker: 'Sas de Thulé-7',
    text: `Votre voix claque dans l'intercom avec la froideur tranchante d'un vétéran du vide. Votre main gantée repose sur la crosse de votre 9mm frangible, prêt à tirer deux balles par ricochet calculé.

Kael déglutit visiblement sous son casque. Il abaisse son pistolet à 45 degrés :
« Je ne suis pas venu pour mourir dans un sas rouillé de la Ceinture, Sauveteur. Je fais appliquer la loi de Sol. »

Voronov vous jauge. Il sait qu'en microgravité (0.04g), un tir précipité sans point d'ancrage le ferait tournoyer au plafond, offrant une cible immobile.
« D'accord, le cow-boy. Tu as l'initiative. Alors parle. Comment on partage ? »`,
    choices: [
      {
        id: 'c_consigner_veille_mutuelle',
        text: '« Lina vient avec moi dans ma navette avec le conteneur. Kael dresse le rapport de scellé. Voronov, tu prends la capsule de sauvetage 3 et tu dégages. »',
        nextId: 'resolution_accord_veille_mutuelle',
      },
      {
        id: 'c_arrestation_voronov',
        text: '« Voronov, lâche ton arme sur le caillebotis. Kael, passe-lui les fers. Ensuite on relance le chauffage. »',
        nextId: 'arrestation_voronov_node',
      },
      {
        id: 'c_double_jeu',
        text: '[Tromperie] (Chuchoter à Voronov) « Fais semblant de te rendre. Dès que Kael a le dos tourné, on neutralise la Veille et on partage la prime. »',
        nextId: 'tromperie_voronov_node',
      },
    ],
  },

  intimidation_fail: {
    id: 'intimidation_fail',
    speaker: 'Dimitri Voronov',
    faction: 'Kombinat',
    text: `Voronov explose d'un rire méprisant :
« Des menaces de syndicaliste sous-payé ! J'ai servi six ans dans les milices d'Encelade, mon vieux. Vos rodomontades ne marchent pas avec moi. »
Il tire le premier ! Le claquement assourdissant de la poudre retentit dans l'espace confiné !`,
    choices: [
      {
        id: 'c_combat_immediat',
        text: '[Combat] Riposter immédiatement !',
        nextId: 'combat_escalation',
      },
    ],
  },

  // VIGILANCE REUSSIE
  vigilance_success: {
    id: 'vigilance_success',
    speaker: 'Observation tactique',
    text: `[VIGILANCE : 2 DR - SUCCÈS MAJEUR]
Vos yeux entraînés analysent la scène en une fraction de seconde :
1. **Lina** est au bord du choc hypovolémique. Son sang coagule difficilement sous la basse pression, mais elle garde la main crispée sur la goupille de sécurité du conteneur cryogénique. Si elle s'effondre, le conteneur pourrait se dépressuriser.
2. **Kael** est terrifié par la contamination cométaire : ses tirs chercheront à protéger le conteneur, pas à le détruire.
3. **Voronov** n'est PAS ancré à la rambarde avec ses sangles magnétiques ! S'il tire son gros calibre 10mm, la loi de Newton va l'expulser en arrière vers la porte du broyeur à minerai.
4. Juste à droite de votre coude se trouve le levier manuel de purge d'azote et le disjoncteur du chauffage de secours.`,
    choices: [
      {
        id: 'c_exploiter_recul',
        text: '[Tactique / Apesanteur] Exploiter le manque d\'ancrage de Voronov pour le déstabiliser sans tirer.',
        nextId: 'destabiliser_voronov_node',
      },
      {
        id: 'c_actionner_chauffage',
        text: '[Systèmes de survie] Enclencher le circuit thermique de secours d\'un coup sec !',
        nextId: 'reparer_chauffage_direct',
      },
      {
        id: 'c_viser_voronov',
        text: '[Combat] Profiter de son absence d\'ancrage pour lui tirer dans l\'épaule !',
        nextId: 'combat_escalation',
      },
    ],
  },

  vigilance_fail: {
    id: 'vigilance_fail',
    speaker: 'Observation tactique',
    text: `Le givre sur votre visière et le stroboscope d'urgence brouillent vos repères. Tout le monde crie en même temps sur le canal radio ouvert. Vous ne distinguez pas qui va faire feu le premier !`,
    choices: [
      {
        id: 'c_choix_survie',
        text: '[Systèmes de survie] « Écoutez-moi tous ! Le sas gèle à vue d\'œil ! »',
        nextId: 'check_survie',
      },
      {
        id: 'c_combat_reflexe',
        text: '[Combat] Se mettre à couvert et dégainer !',
        nextId: 'combat_escalation',
      },
    ],
  },

  // SOIGNER LINA
  soigner_lina_interaction: {
    id: 'soigner_lina_interaction',
    speaker: 'Sas de Thulé-7',
    text: `Vous avancez avec précaution, les mains bien visibles. Vous sortez la rustine pneumatique de votre harnais.
Lina retient un sanglot de soulagement lorsque la bande polymère claque contre sa combinaison, créant un joint hermétique instantané.
Vous pressez l'auto-injecteur de coagulant contre sa cuisse.
Le moniteur de sa combinaison émet un bip vert : [PRESSION STABILISÉE - SAIGNEMENT STOPPÉ].

Lina vous remet la poignée du conteneur cryogénique :
« Prends-le, Vaelen... C'est la Mutuelle qui doit décider. Il y a des composés aminés extraterrestres là-dedans. Ça vaut des fortunes, ou ça peut sauver nos colonies de la stérilité des sols. »

Kael s'approche prudemment :
« Sauveteur... vous avez agi honorablement. Maintenant, remettez ce conteneur à la Veille. Nous garantissons une commission de 25% à la Mutuelle et l'amnistie médicale pour Lina. »

Voronov ricane, l'arme toujours pointée :
« Ne sois pas naïf. La Veille va étouffer la découverte pour préserver les cours boursiers de Mars et de la Terre. Donne-le-moi, et vous avez 100 000 crédits d'Hélion en bons au porteur. »`,
    choices: [
      {
        id: 'c_choix_mutuelle',
        text: '[Loyauté Mutuelle] « Ce conteneur appartient aux mineurs de la Ceinture. Lina et moi partons avec dans mon remorqueur. Personne ne nous arrêtera. »',
        nextId: 'fin_mutuelle_independante',
      },
      {
        id: 'c_choix_veille',
        text: '[Accord Veille] « Marché conclu, Inspecteur. La Veille prend les échantillons sous scellé conjoint, Lina est évacuée et soignée à la station Vesta. Voronov est arrêté. »',
        nextId: 'fin_veille_legale',
      },
      {
        id: 'c_choix_kombinat',
        text: '[Pacte Hélion] « Voronov, virez les 100 000 crédits sur mon compte chiffré à Titan. Le conteneur est à vous. »',
        nextId: 'fin_kombinat_trahison',
      },
      {
        id: 'c_refus_combat',
        text: '[Combat] Neutraliser Voronov pour assurer la sécurité de l\'évacuation.',
        nextId: 'combat_escalation',
      },
    ],
  },

  // REPARATION
  reparer_chauffage_direct: {
    id: 'reparer_chauffage_direct',
    speaker: 'Système Thermique Thulé-7',
    text: `[DÉGIVRAGE D'URGENCE ACTIVÉ]
Vous abattez le disjoncteur thermique et shuntez le relais caloporteur avec la pointe de votre multimètre. Un grondement sourd parcourt les parois en alliage de titane.
Un souffle d'air chaud à +18°C jaillit des buses du plafond. Les cristaux de glace sur les visières fondent en ruisselant.
Le compte à rebours environnemental est neutralisé !

La surprise générale paralyse Voronov et Kael pendant trois secondes capitales.`,
    choices: [
      {
        id: 'c_profiter_surprise_desarmer',
        text: '[Coordination / Tir] Profiter de l\'effet de surprise pour désarmer Voronov d\'un tir précis dans la main !',
        skillReq: {
          skillId: 'armes_poing',
          skillName: 'Armes de poing',
          targetScore: 55,
          difficultyMod: -10,
        },
        nextId: 'check_desarmer_voronov',
      },
      {
        id: 'c_discours_paix',
        text: '[Persuasion] « La chaleur est revenue. Nous pouvons tous vivre. Posons les armes et signons un protocole d\'arbitrage tripartite. »',
        skillReq: {
          skillId: 'persuasion',
          skillName: 'Persuasion',
          targetScore: 50,
          difficultyMod: 0,
        },
        nextId: 'check_persuasion_finale',
      },
    ],
  },

  // EXPLOITER RECUL ZERO-G
  destabiliser_voronov_node: {
    id: 'destabiliser_voronov_node',
    speaker: 'Physique Spatiale (Action Newtonienne)',
    text: `D'un coup de botte calculé contre la cloison d'amarrage, vous propulsez une bonbonne d'argon vide de 15 kg droit vers le torse de Voronov.
Flottant sans ancrage magnétique, l'agent d'Hélion percute le bidon. Selon la troisième loi de Newton, l'inertie l'arrache du sol et l'envoie valser en toupie incontrôlable contre la grille du sas supérieur !
Son pistolet lui échappe et dérive lentement dans l'air raréfié.

Kael se jette sur l'arme flottante et la sécurise en un geste net.
« Voronov, vous êtes en état d'arrestation sous mandat d'interception orbitale ! » rugit l'inspecteur.`,
    choices: [
      {
        id: 'c_conclusion_pacifique',
        text: 'Soigner Lina et sceller le conteneur avec l\'inspecteur Kael.',
        nextId: 'fin_veille_legale',
      },
      {
        id: 'c_trahir_kael',
        text: '[Trahison] Braquer Kael maintenant que Voronov est hors-jeu pour garder le conteneur pour la Mutuelle seule !',
        nextId: 'combat_escalation',
      },
    ],
  },

  // ARRESTATION VORONOV
  arrestation_voronov_node: {
    id: 'arrestation_voronov_node',
    speaker: 'Inspecteur Kael',
    faction: 'Veille',
    text: `Kael passe des serre-câbles en polymère haute résistance autour des poignets de Voronov, qui crache des injures en russe et en argot des mines de Titan.
« Votre carrière de mercenaire s'arrête ici, Voronov, » déclare froidement l'officier de la Veille.

Il se tourne vers vous :
« Sauveteur Voss. La Mutuelle a prouvé son professionnalisme. En vertu de l'article 33 des traités solaires, vous êtes nommé dépositaire légal des échantillons jusqu'à la commission d'arbitrage de Cérès. »`,
    choices: [
      {
        id: 'c_fin_triomphale',
        text: 'Escorter Lina et le conteneur vers votre navette de sauvetage.',
        nextId: 'fin_victoire_diplomatique',
      },
    ],
  },

  // COMBAT TRIGGER
  combat_escalation: {
    id: 'combat_escalation',
    speaker: 'Système Tactique de Combat',
    faction: 'Système',
    text: `[ALARME COMBAT ENGAGÉ - TOURS DE 5 SECONDES]
La situation explose ! Les armes crachent leurs projectiles frangibles dans un sifflement sec.
En microgravité, chaque balle manquée frappe les cloisons renforcées dans un éclat de poussière de céramique.
Gérez vos Points d'Action (PA), surveillez votre ancrage pour éviter le recul newtonien et abattez vos adversaires avant que le froid n'anéantisse vos fonctions vitales !`,
    choices: [],
    isCombatTrigger: true,
  },

  // --- FINS DU JEU ---
  fin_victoire_diplomatique: {
    id: 'fin_victoire_diplomatique',
    speaker: 'Épilogue : Triomphe de la Raison',
    text: `[FIN : RÉSOLUTION DIPLOMATIQUE TRIPARTITE]
Contre toute attente au fin fond de la Ceinture d'astéroïdes, vous avez su briser la spirale de mort de Thulé-7 sans verser une goutte de sang de plus.

Lina a été stabilisée et rapatriée vers la station médicale de Vesta.
L'agent Voronov croupit dans les geôles orbitales de la Veille.
Le conteneur de la comète Sereguine a été remis à une commission mixte réunissant l'Office de la Veille et le Syndicat de la Mutuelle. Ses échantillons de glace prébiotique ont ouvert une nouvelle ère pour la synthèse d'hydrocarbures écologiques, sans que les mégacorporations de Titan ne puissent en breveter le monopole.

Dans les coursives de Cérès, votre nom de Sauveteur est désormais respecté : celui qui a gardé la tête froide quand Sol perdait la raison.`,
    choices: [
      { id: 'c_restart', text: 'Recommencer la démo technique', nextId: 'start' },
    ],
    isEnding: true,
    endingType: 'victory_diplomatic',
  },

  fin_veille_legale: {
    id: 'fin_veille_legale',
    speaker: 'Épilogue : L\'Ordre de la Veille',
    text: `[FIN : RESPECT DU PROTOCOLE DE LA VEILLE]
Vous avez fait le choix de la loi et de la sécurité sanitaire. Les échantillons cométaires ont été transférés dans un sarcophage scellé à bord de la corvette de la Veille.

Lina a reçu des soins intensifs et la Mutuelle a perçu une compensation financière substantielle pour la découverte. Bien que certains camarades de la Ceinture vous reprochent d'avoir cédé aux bureaucrates martiens, personne n'a péri dans le froid de Thulé-7. La paix fragile du système solaire a tenu un jour de plus.`,
    choices: [
      { id: 'c_restart', text: 'Recommencer la démo technique', nextId: 'start' },
    ],
    isEnding: true,
    endingType: 'victory_veille',
  },

  fin_mutuelle_independante: {
    id: 'fin_mutuelle_independante',
    speaker: 'Épilogue : La Fierté de la Ceinture',
    text: `[FIN : VICTOIRE DE LA MUTUELLE]
Vous avez ramené Lina et le conteneur cryogénique intact au bastion minier de Cérès.
Les mineurs ont fêté votre retour dans les cantines souterraines. Grâce aux composés cométaires, la Mutuelle a pu négocier des contrats d'approvisionnement directs en carburant de fusion, coupant court au chantage du Kombinat Hélion.

Vous êtes devenu un héros pour les gens du vide : un véritable enfant de la Ceinture qui n'a baissé les yeux ni devant les inspecteurs de Mars, ni devant les mercenaires de Titan.`,
    choices: [
      { id: 'c_restart', text: 'Recommencer la démo technique', nextId: 'start' },
    ],
    isEnding: true,
    endingType: 'victory_mutuelle',
  },

  fin_kombinat_trahison: {
    id: 'fin_kombinat_trahison',
    speaker: 'Épilogue : L\'Or de Titan',
    text: `[FIN : LE CYNISME D\'HÉLION]
Vous avez empoché les 100 000 crédits chiffrés d'Hélion. Voronov a embarqué le conteneur à bord d'une navette furtive à destination des nuages de méthane de Titan.

Vous avez abandonné Lina et vos camarades de la Mutuelle à leur sort. Vous êtes riche, certes, mais votre matricule de Sauveteur est radié et un contrat de mise à mort circule désormais sur tous les canaux pirates de la Ceinture. Dans le vide spatial, la fortune ne réchauffe pas longtemps quand on n'a plus nulle part où accoster.`,
    choices: [
      { id: 'c_restart', text: 'Recommencer la démo technique', nextId: 'start' },
    ],
    isEnding: true,
    endingType: 'victory_kombinat',
  },

  fin_defaite_hypoxie: {
    id: 'fin_defaite_hypoxie',
    speaker: 'Système Médical d\'Urgence',
    text: `[FIN : HYPOTHERMIE ET DÉPRESSURISATION TERMINALE]
Le thermomètre s'effondre sous les -60°C. L'oxygène baisse sous le seuil de conscience utile (11 kPa).
Vos doigts engourdis par le gel ne répondent plus aux commandes de votre combinaison. Vos poumons se vident dans un dernier spasme givré.

Dans le sas silencieux de Thulé-7, quatre cadavres en armure flottent désormais en microgravité autour d'un conteneur cryogénique que personne n'ouvrira jamais. Le vide a toujours le dernier mot.`,
    choices: [
      { id: 'c_restart', text: 'Réessayer la mission', nextId: 'start' },
    ],
    isEnding: true,
    endingType: 'defeat_hypoxia',
  },
};
