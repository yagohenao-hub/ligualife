export interface IndexedStory {
  id: number;
  title: string;
  author: string;
  wordCount: number;
  mood: string;
  url: string;
  source?: string;
  language?: 'en' | 'es';
}

export const STORIES_INDEX: IndexedStory[] = [
  // --- ESPAÑOL (ELEJANDRIA / DOMINIO PÚBLICO NATIVO) ---
  { id: 1001, title: "El Almohadón de Plumas", author: "Horacio Quiroga", wordCount: 1200, mood: "Horror", url: "https://www.elejandria.com/libro/el-almohadon-de-plumas/horacio-quiroga/98", language: 'es' },
  { id: 1002, title: "La Miel Silvestre", author: "Horacio Quiroga", wordCount: 1800, mood: "Adventure", url: "https://www.elejandria.com/libro/la-miel-silvestre/horacio-quiroga/223", language: 'es' },
  { id: 1003, title: "Las Medias de los Flamencos", author: "Horacio Quiroga", wordCount: 1500, mood: "Whimsical", url: "https://www.elejandria.com/libro/las-medias-de-los-flamencos/horacio-quiroga/224", language: 'es' },
  { id: 1004, title: "La Tortuga Gigante", author: "Horacio Quiroga", wordCount: 1200, mood: "Whimsical", url: "https://www.elejandria.com/libro/la-tortuga-gigante/horacio-quiroga/222", language: 'es' },
  { id: 1005, title: "El Loro Pelado", author: "Horacio Quiroga", wordCount: 1000, mood: "Whimsical", url: "https://www.elejandria.com/libro/el-loro-pelado/horacio-quiroga/221", language: 'es' },
  { id: 1006, title: "El Monte de las Ánimas", author: "Gustavo Adolfo Bécquer", wordCount: 3500, mood: "Horror", url: "https://www.elejandria.com/libro/el-monte-de-las-animas/becquer-gustavo-adolfo/327", language: 'es' },
  { id: 1007, title: "Los Ojos Verdes", author: "Gustavo Adolfo Bécquer", wordCount: 2500, mood: "Fantasy", url: "https://www.elejandria.com/libro/los-ojos-verdes/becquer-gustavo-adolfo/326", language: 'es' },
  { id: 1008, title: "El Rayo de Luna", author: "Gustavo Adolfo Bécquer", wordCount: 3000, mood: "Fantasy", url: "https://www.elejandria.com/libro/el-rayo-de-luna/becquer-gustavo-adolfo/328", language: 'es' },
  { id: 1009, title: "¡Adiós, Cordera!", author: "Leopoldo Alas «Clarín»", wordCount: 2800, mood: "Drama", url: "https://www.elejandria.com/libro/adios-cordera/clarin/412", language: 'es' },
  { id: 1010, title: "Cuento Futuro", author: "Leopoldo Alas «Clarín»", wordCount: 4500, mood: "Sci-Fi", url: "https://www.elejandria.com/libro/cuento-futuro/clarin/413", language: 'es' },
  { id: 1011, title: "El Matadero", author: "Esteban Echeverría", wordCount: 7000, mood: "Classic", url: "https://www.elejandria.com/libro/el-matadero/esteban-echeverria/299", language: 'es' },
  { id: 1012, title: "El Licenciado Vidriera", author: "Miguel de Cervantes", wordCount: 10000, mood: "Classic", url: "https://www.elejandria.com/libro/el-licenciado-vidriera/miguel-de-cervantes/105", language: 'es' },
  { id: 1013, title: "Rinconete y Cortadillo", author: "Miguel de Cervantes", wordCount: 12000, mood: "Adventure", url: "https://www.elejandria.com/libro/rinconete-y-cortadillo/miguel-de-cervantes/106", language: 'es' },
  { id: 1014, title: "El Gigante Egoísta", author: "Oscar Wilde (ES)", wordCount: 1000, mood: "Whimsical", url: "https://www.elejandria.com/libro/el-gigante-egoista/oscar-wilde/134", language: 'es' },
  { id: 1015, title: "El Príncipe Feliz", author: "Oscar Wilde (ES)", wordCount: 2000, mood: "Whimsical", url: "https://www.elejandria.com/libro/el-principe-feliz/oscar-wilde/133", language: 'es' },
  { id: 1016, title: "El Gato Negro", author: "Edgar Allan Poe (ES)", wordCount: 4000, mood: "Horror", url: "https://www.elejandria.com/libro/el-gato-negro/edgar-allan-poe/122", language: 'es' },
  { id: 1017, title: "El Corazón Delator", author: "Edgar Allan Poe (ES)", wordCount: 2000, mood: "Horror", url: "https://www.elejandria.com/libro/el-corazon-delator/edgar-allan-poe/83", language: 'es' },
  { id: 1018, title: "Atenea", author: "Ignacio Manuel Altamirano", wordCount: 5000, mood: "Drama", url: "https://www.elejandria.com/libro/atenea/ignacio-manuel-altamirano/421", language: 'es' },

  // --- ENGLISH (SHORT STORIES - DOMAIN EXCELLENCE) ---
  { id: 2001, title: "The Yellow Wallpaper", author: "Charlotte Perkins Gilman", wordCount: 6031, mood: "Mystery", url: "https://www.gutenberg.org/cache/epub/1952/pg1952.txt", language: 'en' },
  { id: 2002, title: "The Cask of Amontillado", author: "Edgar Allan Poe", wordCount: 2335, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/2151/pg2151.txt", language: 'en' },
  { id: 2003, title: "The Tell-Tale Heart", author: "Edgar Allan Poe", wordCount: 2100, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/16328/pg16328.txt", language: 'en' },
  { id: 2004, title: "The Masque of the Red Death", author: "Edgar Allan Poe", wordCount: 2400, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/2151/pg2151.txt", language: 'en' },
  { id: 2005, title: "The Monkey's Paw", author: "W.W. Jacobs", wordCount: 3500, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/366/pg366.txt", language: 'en' },
  { id: 2006, title: "The Gift of the Magi", author: "O. Henry", wordCount: 2000, mood: "Classic", url: "https://www.gutenberg.org/cache/epub/911/pg911.txt", language: 'en' },
  { id: 2007, title: "The Ransom of Red Chief", author: "O. Henry", wordCount: 3500, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/1644/pg1644.txt", language: 'en' },
  { id: 2008, title: "The Open Window", author: "Saki", wordCount: 1200, mood: "Mystery", url: "https://www.gutenberg.org/cache/epub/269/pg269.txt", language: 'en' },
  { id: 2009, title: "The Interlopers", author: "Saki", wordCount: 2100, mood: "Adventure", url: "https://www.gutenberg.org/cache/epub/1618/pg1618.txt", language: 'en' },
  { id: 2010, title: "The Selfish Giant", author: "Oscar Wilde", wordCount: 1000, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/60/pg60.txt", language: 'en' },
  { id: 2011, title: "The Nightingale and the Rose", author: "Oscar Wilde", wordCount: 2000, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/100/pg100.txt", language: 'en' },
  { id: 2012, title: "Araby", author: "James Joyce", wordCount: 2300, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/2802/pg2802.txt", language: 'en' },
  { id: 2013, title: "The Signal-Man", author: "Charles Dickens", wordCount: 4800, mood: "Mystery", url: "https://www.gutenberg.org/cache/epub/1400/pg1400.txt", language: 'en' },
  { id: 2014, title: "The Necklace", author: "Guy de Maupassant", wordCount: 3000, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/1400/pg1400.txt", language: 'en' },
  { id: 2015, title: "The Bet", author: "Anton Chekhov", wordCount: 2800, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/145/pg145.txt", language: 'en' },
  { id: 2016, title: "The Star", author: "H.G. Wells", wordCount: 3200, mood: "Sci-Fi", url: "https://www.gutenberg.org/cache/epub/36/pg36.txt", language: 'en' },
  { id: 2017, title: "Tobermory", author: "Saki", wordCount: 2100, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/269/pg269.txt", language: 'en' },
  { id: 2018, title: "Gabriel-Ernest", author: "Saki", wordCount: 2800, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/269/pg269.txt", language: 'en' },
  { id: 2019, title: "The Call of the Wild (Chapter 1)", author: "Jack London", wordCount: 4200, mood: "Adventure", url: "https://www.gutenberg.org/cache/epub/215/pg215.txt", language: 'en' },
  { id: 2020, title: "Heart of Darkness (Chapter 1)", author: "Joseph Conrad", wordCount: 5200, mood: "Adventure", url: "https://www.gutenberg.org/cache/epub/219/pg219.txt", language: 'en' },
  { id: 2021, title: "The Happy Prince", author: "Oscar Wilde", wordCount: 3500, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/60/pg60.txt", language: 'en' },
  { id: 2022, title: "The Three Hermits", author: "Leo Tolstoy", wordCount: 2500, mood: "Classic", url: "https://www.gutenberg.org/cache/epub/1399/pg1399.txt", language: 'en' },
  { id: 2023, title: "The Piece of String", author: "Guy de Maupassant", wordCount: 2100, mood: "Classic", url: "https://www.gutenberg.org/cache/epub/1400/pg1400.txt", language: 'en' },
  { id: 2024, title: "Rip Van Winkle", author: "Washington Irving", wordCount: 7000, mood: "Mystery", url: "https://www.gutenberg.org/cache/epub/170/pg170.txt", language: 'en' }
];
