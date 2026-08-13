export interface IndexedStory {
  id: number | string;
  title: string;
  author: string;
  wordCount: number;
  mood: string;
  url: string;
  language?: 'en' | 'es';
  source?: string;
}

export const STORIES_LIBRARY: IndexedStory[] = [
  // --- BATCH 1 & 2 CONSOLIDATED ---
  { id: "es-967", title: "El almohadón de plumas", author: "Horacio Quiroga", wordCount: 1269, mood: "Horror", url: "https://www.elejandria.com/libro/el-almohadon-de-plumas/horacio-quiroga/98", language: 'es', source: 'Elejandría' },
  { id: "es-965", title: "A la deriva", author: "Horacio Quiroga", wordCount: 1100, mood: "Adventure", url: "https://www.elejandria.com/libro/a-la-deriva/horacio-quiroga/220", language: 'es', source: 'Elejandría' },
  { id: "es-971", title: "El hijo", author: "Horacio Quiroga", wordCount: 1200, mood: "Drama", url: "https://www.elejandria.com/libro/el-hijo/horacio-quiroga/916", language: 'es', source: 'Elejandría' },
  { id: "es-rd-1", title: "El Rey Burgués", author: "Rubén Darío", wordCount: 1500, mood: "Classic", url: "https://www.elejandria.com/libro/azul/ruben-dario/121", language: 'es', source: 'Elejandría' },
  { id: "es-rd-2", title: "El Sátiro Sordo", author: "Rubén Darío", wordCount: 1800, mood: "Fantasy", url: "https://www.elejandria.com/libro/azul/ruben-dario/121", language: 'es', source: 'Elejandría' },
  { id: "es-vbi-1", title: "La cuna vacía", author: "Vicente Blasco Ibáñez", wordCount: 1200, mood: "Drama", url: "https://www.elejandria.com/libro/cuentos-valencianos/vicente-blasco-ibanez/952", language: 'es', source: 'Elejandría' },
  { id: "es-an-1", title: "El ángel caído", author: "Amado Nervo", wordCount: 1400, mood: "Mystery", url: "https://www.elejandria.com/libro/cuentos-misteriosos/amado-nervo/1020", language: 'es', source: 'Elejandría' },
  
  { id: "en-2776", title: "The Gift of the Magi", author: "O. Henry", wordCount: 2100, mood: "Classic", url: "https://www.gutenberg.org/cache/epub/2776/pg2776.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-1300", title: "After Twenty Years", author: "O. Henry", wordCount: 1300, mood: "Mystery", url: "https://www.gutenberg.org/cache/epub/2776/pg2776.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-ab-1", title: "One Summer Night", author: "Ambrose Bierce", wordCount: 600, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/4366/pg4366.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-ab-2", title: "Oil of Dog", author: "Ambrose Bierce", wordCount: 800, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/4366/pg4366.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-hca-1", title: "The Little Match Girl", author: "Hans Christian Andersen", wordCount: 700, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/1597/pg1597.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-hca-2", title: "The Princess and the Pea", author: "Hans Christian Andersen", wordCount: 400, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/1597/pg1597.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-gr-1", title: "Rumpelstiltskin", author: "The Brothers Grimm", wordCount: 1100, mood: "Fantasy", url: "https://www.gutenberg.org/cache/epub/2591/pg2591.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-km-1", title: "Miss Brill", author: "Katherine Mansfield", wordCount: 1500, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/1472/pg1472.txt", language: 'en', source: 'Gutenberg' },
  
  // --- ADDING MORE SHORT STORY MASTERS ---
  { id: "es-rd-4", title: "La muerte de la emperatriz de la China", author: "Rubén Darío", wordCount: 2200, mood: "Drama", url: "https://www.elejandria.com/libro/azul/ruben-dario/121", language: 'es', source: 'Elejandría' },
  { id: "en-ab-4", title: "Chickamauga", author: "Ambrose Bierce", wordCount: 2500, mood: "Horror", url: "https://www.gutenberg.org/cache/epub/375/pg375.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-hca-4", title: "The Emperor's New Clothes", author: "Hans Christian Andersen", wordCount: 1500, mood: "Whimsical", url: "https://www.gutenberg.org/cache/epub/1597/pg1597.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-gr-2", title: "The Frog Prince", author: "The Brothers Grimm", wordCount: 1200, mood: "Fantasy", url: "https://www.gutenberg.org/cache/epub/2591/pg2591.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-gr-3", title: "Hansel and Gretel", author: "The Brothers Grimm", wordCount: 2400, mood: "Fantasy", url: "https://www.gutenberg.org/cache/epub/2591/pg2591.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-km-2", title: "The Fly", author: "Katherine Mansfield", wordCount: 1800, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/1472/pg1472.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-saki-1", title: "The Open Window", author: "Saki", wordCount: 1100, mood: "Mystery", url: "https://www.gutenberg.org/cache/epub/1477/pg1477.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-c-1", title: "The Bet", author: "Anton Chekhov", wordCount: 2100, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/145/pg145.txt", language: 'en', source: 'Gutenberg' },
  { id: "en-m-1", title: "The Necklace", author: "Guy de Maupassant", wordCount: 2500, mood: "Drama", url: "https://www.gutenberg.org/cache/epub/1400/pg1400.txt", language: 'en', source: 'Gutenberg' }
];
