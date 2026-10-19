import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fonts } from "./tokens";

// Font files ship in public/fonts (SIL OFL) so renders never depend on the network.
const ARABIC_RANGE =
  "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

for (const weight of ["400", "700"]) {
  loadFont({ family: fonts.arabic, weight, unicodeRange: ARABIC_RANGE, url: staticFile(`fonts/cairo-arabic-${weight}-normal.woff2`) });
  loadFont({ family: fonts.arabic, weight, unicodeRange: LATIN_RANGE, url: staticFile(`fonts/cairo-latin-${weight}-normal.woff2`) });
  loadFont({ family: fonts.latin, weight, unicodeRange: LATIN_RANGE, url: staticFile(`fonts/poppins-latin-${weight}-normal.woff2`) });
}

/** Cairo first so Arabic glyphs use it; Latin-first text uses Poppins. */
export const arabicStack = `"${fonts.arabic}", "${fonts.latin}", sans-serif`;
export const latinStack = `"${fonts.latin}", "${fonts.arabic}", sans-serif`;
