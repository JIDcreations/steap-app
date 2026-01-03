// src/theme.ts

// Kleuren hifi
export const COLORS = {
  // Background
  background: '#F2EFDD',      // zachte groene achtergrond
  backgroundAlt: '#BFCFBF',   // iets donkerder variant voor sections

  // Primary / surfaces
  primaryDark: '#243235',     // navbar, donkere kaarten, titels
  primaryTextOnDark: '#FDFBFC',

  // Cards
  teaCardDark: '#243235',
  teaCardGreen: '#4A8A77',    // eventueel overschrijf je deze per vibe/type
  teaCardText: '#D6F4CD',

  // Accent / acties
  accent: '#4A8A77',          // secundaire green (buttons, CTA)
  accentSoft: '#7D9B93',      // hover/secondary state
  accentBadge: '#D6F4CD',     // sterretje-score badge

  // Text
  text: '#243235',            // standaard body op lichte achtergrond
  textSoft: '#4F635C',        // subtitels, helper text
  textOnAccent: '#FDFBFC',
  textMutedOnCard: '#BBD4C0',

  // Borders / lijnen
  border: '#243235',
  borderSoft: 'rgba(36,50,53,0.25)',

  // Misc
  navbarBg: '#243235',
  navbarIcon: '#FDFBFC',

  success: '#4A8A77',
  danger: '#CC4B4B',
};

// Spacing tokens (afgeleid van je layout)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Corner 
export const RADIUS = {
  sm: 8,     // tags, kleine pill buttons
  md: 12,    // input fields
  lg: 20,    // thee kaartjes
  xl: 28,    // grote hero cards / profielkaart
  pill: 999, // volledig afgeronde pill
};

// Typografie
export const FONTS = {
  display: 'PlayfairDisplay-Bold',   // grote titels bovenaan scherm
  heading: 'PlayfairDisplay-Bold',   // titels op kaarten
  body: 'Poppins-Regular',
  bodyMedium: 'Poppins-Medium',
  bodyLight: 'Poppins-Light',
};

export const TYPO = {
  // "STEAP", "Library", "Post tea", "Profile"
  screenTitle: {
    fontFamily: FONTS.display,
    fontSize: 32,
    letterSpacing: 0.25, // 25%
  },

  // Thee kaart titels
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
  },

  // Subtitel onder theenaam ("Calming Green")
  cardSubtitle: {
    fontFamily: FONTS.bodyLight,
    fontSize: 16,
  },

  // Body copy (beschrijving van de thee)
  body: {
    fontFamily: FONTS.bodyLight,
    fontSize: 16,
    lineHeight: 22,
  },

  bodyMedium: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
  },

  small: {
    fontFamily: FONTS.bodyLight,
    fontSize: 16,
  },

  navLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
  },

  display2: {
  fontFamily: FONTS.display,   // PlayfairDisplay-Bold
  fontSize: 24,
},

display1: {
  fontFamily: FONTS.display,  // PlayfairDisplay-Bold
  fontSize: 32,
  letterSpacing: 8,            // 25% of 32px
},

};

// Schaduw voor kaarten (optioneel)
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
};

