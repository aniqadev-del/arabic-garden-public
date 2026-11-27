const card = (ar, en, picture, spoken = ar) => ({ ar, en, picture, spoken });
const show = (item) => ({ kind: 'show', item });
const choose = (item, others, mode = 'listen', prompt) => ({ kind: 'choose', item, options: [item, ...others], mode, prompt });
const trace = (item) => ({ kind: 'trace', item });
const say = (item, prompt) => ({ kind: 'say', item, prompt });
const story = (lines) => ({ kind: 'story', lines });

const words = {
  hello: card('مَرْحَبًا', 'Hello', '👋'), bye: card('مَعَ السَّلَامَةِ', 'Goodbye', '😊'),
  thanks: card('شُكْرًا', 'Thank you', '💛'), yes: card('نَعَمْ', 'Yes', '👍'), no: card('لَا', 'No', '✋'),
  name: card('اِسْمِي…', 'My name is…', '🙂', 'اِسْمِي'), how: card('كَيْفَ حَالُكِ؟', 'How are you?', '👋'),
  well: card('أَنَا بِخَيْرٍ', 'I’m well', '😊'),
  red: card('أَحْمَر', 'Red', '🔴'), blue: card('أَزْرَق', 'Blue', '🔵'),
  yellow: card('أَصْفَر', 'Yellow', '🟡'), green: card('أَخْضَر', 'Green', '🟢'),
  one: card('وَاحِد', 'One', '١'), two: card('اِثْنَانِ', 'Two', '٢'), three: card('ثَلَاثَة', 'Three', '٣'),
  four: card('أَرْبَعَة', 'Four', '٤'), five: card('خَمْسَة', 'Five', '٥'),
  six: card('سِتَّة', 'Six', '٦'), seven: card('سَبْعَة', 'Seven', '٧'), eight: card('ثَمَانِيَة', 'Eight', '٨'),
  nine: card('تِسْعَة', 'Nine', '٩'), ten: card('عَشَرَة', 'Ten', '١٠'),
  water: card('مَاء', 'Water', '💧'), apple: card('تُفَّاحَة', 'Apple', '🍎'),
  milk: card('حَلِيب', 'Milk', '🥛'), banana: card('مَوْزَة', 'Banana', '🍌'),
  bread: card('خُبْز', 'Bread', '🍞'), orange: card('بُرْتُقَالَة', 'Orange', '🍊'),
  cat: card('قِطَّة', 'Cat', '🐱'), dog: card('كَلْب', 'Dog', '🐶'),
  fish: card('سَمَكَة', 'Fish', '🐟'), bird: card('عُصْفُور', 'Bird', '🐦'),
  camel: card('جَمَل', 'Camel', '🐫'), bunny: card('أَرْنَب', 'Rabbit', '🐰'),
  mom: card('أُمّ', 'Mother', '👩'), dad: card('أَب', 'Father', '👨'),
  sister: card('أُخْت', 'Sister', '👧'), brother: card('أَخ', 'Brother', '👦'),
  hand: card('يَد', 'Hand', '✋'), eye: card('عَيْن', 'Eye', '👁️'),
  ear: card('أُذُن', 'Ear', '👂'), mouth: card('فَم', 'Mouth', '👄'),
  book: card('كِتَاب', 'Book', '📘'), pencil: card('قَلَم', 'Pencil', '✏️'),
  bag: card('حَقِيبَة', 'Bag', '🎒'), chair: card('كُرْسِيّ', 'Chair', '🪑'),
  door: card('بَاب', 'Door', '🚪'), house: card('بَيْت', 'House', '🏠'),
  sun: card('شَمْس', 'Sun', '☀️'), moon: card('قَمَر', 'Moon', '🌙'),
  flower: card('زَهْرَة', 'Flower', '🌼'), tree: card('شَجَرَة', 'Tree', '🌳'),
  sit: card('اِجْلِسِي', 'Sit down', '🪑'), stand: card('قِفِي', 'Stand up', '🧍‍♀️'),
  listen: card('اِسْمَعِي', 'Listen', '👂'), look: card('اُنْظُرِي', 'Look', '👀'),
  open: card('اِفْتَحِي الْكِتَابَ', 'Open the book', '📖'), close: card('أَغْلِقِي الْكِتَابَ', 'Close the book', '📕'),
  please: card('مِنْ فَضْلِكِ', 'Please', '🙏'),
  want: card('أُرِيدُ مَاءً', 'I want water', '💧'),
  seeCat: card('أَرَى قِطَّةً', 'I see a cat', '🐱'), seeBird: card('أَرَى عُصْفُورًا', 'I see a bird', '🐦'),
  thisBook: card('هَذَا كِتَابٌ', 'This is a book', '📘'), thisBag: card('هَذِهِ حَقِيبَةٌ', 'This is a bag', '🎒'),
  above: card('فَوْقَ', 'Above', '⬆️'), below: card('تَحْتَ', 'Under', '⬇️'),
  inside: card('دَاخِلَ', 'Inside', '📦'), next: card('بِجَانِبِ', 'Next to', '↔️'),
};

const letterRows = [
  ['ا', 'أَلِف', 'alif', 'أَرْنَب', 'rabbit', '🐰'], ['ب', 'بَاء', 'bāʼ', 'بَاب', 'door', '🚪'],
  ['ت', 'تَاء', 'tāʼ', 'تُفَّاحَة', 'apple', '🍎'], ['ث', 'ثَاء', 'thāʼ', 'ثَعْلَب', 'fox', '🦊'],
  ['ج', 'جِيم', 'jīm', 'جَمَل', 'camel', '🐫'], ['ح', 'حَاء', 'ḥāʼ', 'حَلِيب', 'milk', '🥛'],
  ['خ', 'خَاء', 'khāʼ', 'خُبْز', 'bread', '🍞'], ['د', 'دَال', 'dāl', 'دُبّ', 'bear', '🐻'],
  ['ذ', 'ذَال', 'dhāl', 'ذُرَة', 'corn', '🌽'], ['ر', 'رَاء', 'rāʼ', 'رُمَّان', 'pomegranate', '🍎'],
  ['ز', 'زَاي', 'zāy', 'زَهْرَة', 'flower', '🌼'], ['س', 'سِين', 'sīn', 'سَمَكَة', 'fish', '🐟'],
  ['ش', 'شِين', 'shīn', 'شَمْس', 'sun', '☀️'], ['ص', 'صَاد', 'ṣād', 'صُنْدُوق', 'box', '📦'],
  ['ض', 'ضَاد', 'ḍād', 'ضِفْدَع', 'frog', '🐸'], ['ط', 'طَاء', 'ṭāʼ', 'طَائِرَة', 'airplane', '✈️'],
  ['ظ', 'ظَاء', 'ẓāʼ', 'ظَرْف', 'envelope', '✉️'], ['ع', 'عَيْن', 'ʿayn', 'عَيْن', 'eye', '👁️'],
  ['غ', 'غَيْن', 'ghayn', 'غَيْمَة', 'cloud', '☁️'], ['ف', 'فَاء', 'fāʼ', 'فِيل', 'elephant', '🐘'],
  ['ق', 'قَاف', 'qāf', 'قَمَر', 'moon', '🌙'], ['ك', 'كَاف', 'kāf', 'كِتَاب', 'book', '📘'],
  ['ل', 'لَام', 'lām', 'لَيْمُون', 'lemon', '🍋'], ['م', 'مِيم', 'mīm', 'مَاء', 'water', '💧'],
  ['ن', 'نُون', 'nūn', 'نَجْمَة', 'star', '⭐'], ['ه', 'هَاء', 'hāʼ', 'هِلَال', 'crescent moon', '🌙'],
  ['و', 'وَاو', 'wāw', 'وَرْدَة', 'rose', '🌹'], ['ي', 'يَاء', 'yāʼ', 'يَد', 'hand', '✋'],
];

export const alphabet = letterRows.map(([ar, spoken, en, example, meaning, picture]) => ({
  ar, en, spoken, example: card(example, meaning, picture),
}));

const topic = (id, title, ar, picture, goal, items, extras = []) => ({
  id, title, ar, picture, goal, steps: [
    ...items.map(show),
    ...items.map((item, index) => choose(item, [items[(index + 1) % items.length], items[(index + 2) % items.length]], 'pictures')),
    ...extras,
  ],
});
const letterLesson = (index, title, goal) => {
  const group = alphabet.slice(index * 4, index * 4 + 4);
  return {
    id: `letters-${index + 1}`, title, ar: group.map((item) => item.ar).join('  '), picture: group[0].ar, goal,
    steps: [
      ...group.map(show),
      ...group.map((item, offset) => choose(item, [group[(offset + 1) % 4], group[(offset + 2) % 4]])),
      trace(group[index % 4]),
    ],
  };
};

const short = [card('بَ', 'ba · fatḥa (a)', null), card('بِ', 'bi · kasra (i)', null), card('بُ', 'bu · ḍamma (u)', null)];
const long = [card('بَا', 'bā · long a', null), card('بِي', 'bī · long i', null), card('بُو', 'bū · long u', null)];
const vowelPairs = short.map((brief, index) => ({
  kind: 'compare', brief, held: long[index], spoken: `${brief.ar} · ${long[index].ar}`,
}));
const joined = [
  { ...card('بـ', 'bāʼ at the start', null, 'بَاء'), example: words.house },
  { ...card('ـبـ', 'bāʼ in the middle', null, 'بَاء'), example: card('جَبَل', 'Mountain', '⛰️') },
  { ...card('ـب', 'bāʼ at the end', null, 'بَاء'), example: words.dog },
  { ...card('د', 'dāl leaves a gap to its left', null, 'دَال'), example: card('مَدْرَسَة', 'School', '🏫') },
];
const gardenStory = [
  card('أَرَى شَجَرَةً.', 'I see a tree.', '🌳'),
  card('تَحْتَ الشَّجَرَةِ قِطَّةٌ.', 'There is a cat under the tree.', '🐱🌳'),
  card('فَوْقَ الشَّجَرَةِ عُصْفُورٌ.', 'There is a bird above the tree.', '🐦🌳'),
];
const makeLesson = (id, title, ar, picture, goal, steps) => ({ id, title, ar, picture, goal, steps });

export const stages = [
  {
    id: 'first', title: 'First Words', ar: 'كَلِمَاتِي الْأُولَى', level: 'Beginner', picture: '🌱', color: 'mint',
    description: 'Say hello, count and name things around you.',
    lessons: [
      topic('hello', 'Say Hello!', 'مَرْحَبًا', '👋', 'Greet someone and say thank you.', [words.hello, words.thanks, words.bye], [say(words.hello, 'Wave and say it!')]),
      topic('colors', 'A Rainbow of Colors', 'الأَلْوَان', '🌈', 'Name four colors and find them around you.', [words.red, words.blue, words.yellow, words.green]),
      topic('numbers', 'Count to Five', 'الأَعْدَاد', '🔢', 'Count five objects and recognize the numerals ١–٥.', [words.one, words.two, words.three, words.four, words.five]),
      topic('snacks', 'Snack Time', 'وَقْتُ الطَّعَام', '🍎', 'Name familiar foods and drinks.', [words.water, words.apple, words.milk, words.banana]),
      topic('pets', 'Animal Friends', 'حَيَوَانَات', '🐱', 'Recognize and say four animal names.', [words.cat, words.dog, words.fish, words.bird]),
      topic('family', 'My Family', 'أُسْرَتِي', '🏡', 'Use family words and introduce yourself.', [words.mom, words.dad, words.sister, words.brother], [say(words.name, 'Say this, then add your name.')]),
      topic('body', 'Move and Point', 'جِسْمِي', '✋', 'Point to the body part you hear.', [words.hand, words.eye, words.ear, words.mouth]),
      topic('classroom', 'In My School Bag', 'حَقِيبَتِي', '🎒', 'Name everyday classroom objects.', [words.book, words.pencil, words.bag, words.chair]),
    ],
  },
  {
    id: 'letters', title: 'Letter Garden', ar: 'حَدِيقَةُ الْحُرُوف', level: 'KG1 Skills', picture: '🌷', color: 'peach',
    description: 'Meet all 28 Arabic letters, listen and trace.',
    lessons: [
      letterLesson(0, 'Meet ا ب ت ث', 'Notice how the dots change the letter.'),
      letterLesson(1, 'Meet ج ح خ د', 'Recognize letter shapes with and without dots.'),
      letterLesson(2, 'Meet ذ ر ز س', 'Hear the sounds and compare similar shapes.'),
      letterLesson(3, 'Meet ش ص ض ط', 'Look for the dots and listen to each example word.'),
      letterLesson(4, 'Meet ظ ع غ ف', 'Match each letter name to its shape.'),
      letterLesson(5, 'Meet ق ك ل م', 'Recognize four new letters and trace one.'),
      letterLesson(6, 'Meet ن ه و ي', 'Meet the last four letters of the alphabet.'),
      makeLesson('sounds', 'First and Last Sounds', 'أَصْوَاتُ الْحُرُوف', '👂', 'Listen for the first and last sounds in familiar words.', [
        show(alphabet[1]), show(alphabet[15]), show(alphabet[23]),
        choose(alphabet[1], [alphabet[2], alphabet[12]], 'sound', { text: words.door.spoken, label: 'Which letter starts the word?' }),
        choose(alphabet[12], [alphabet[14], alphabet[8]], 'sound', { text: words.sun.spoken, label: 'Which letter starts the word?' }),
        choose(alphabet[23], [alphabet[13], alphabet[18]], 'sound', { text: words.pencil.spoken, label: 'Which letter ends the word?' }),
        choose(alphabet[1], [alphabet[2], alphabet[25]], 'sound', { text: words.book.spoken, label: 'Which letter ends the word?' }),
        trace(alphabet[12]),
      ]),
    ],
  },
  {
    id: 'school', title: 'Ready for School', ar: 'جَاهِزَةٌ لِلْمَدْرَسَة', level: 'KG2 Skills', picture: '📚', color: 'lavender',
    description: 'Read little words and build classroom confidence.',
    lessons: [
      makeLesson('vowels', 'Tiny Vowel Marks', 'الْحَرَكَات', '🎵', 'Hear and recognize the short sounds a, i and u.', [
        ...short.map(show), ...short.map((item) => choose(item, short.filter((other) => other !== item))), trace(short[0]),
      ]),
      makeLesson('long-vowels', 'Stretch the Sound', 'الْمُدُود', '🎶', 'Hear the difference between short and long vowels.', [
        ...vowelPairs,
        ...vowelPairs.map(({ brief, held }) => choose(held, [brief], 'vowel')),
        ...vowelPairs.map(({ brief, held }) => choose(brief, [held], 'vowel')),
        say(long[0], 'Say it and stretch the vowel.'),
      ]),
      makeLesson('joins', 'Join the Letters', 'الْحُرُوفُ الْمُتَّصِلَة', '🧩', 'Spot bāʼ in three positions and see why dāl leaves a gap.', [
        ...joined.map(show),
        choose(joined[0], [joined[1], joined[2]], 'reading', { text: words.house.ar, label: 'How does bāʼ look in this word?' }),
        choose(joined[1], [joined[2], joined[0]], 'reading', { text: joined[1].example.ar, label: 'How does bāʼ look in this word?' }),
        choose(joined[2], [joined[0], joined[1]], 'reading', { text: words.dog.ar, label: 'How does bāʼ look in this word?' }),
        trace(words.door),
      ]),
      makeLesson('read', 'Read Little Words', 'أَقْرَأُ كَلِمَات', '📖', 'Blend letters from right to left and read familiar words.', [
        ...[words.door, words.sun, words.moon, words.pencil].map(show),
        choose(words.door, [words.house, words.moon], 'read'),
        choose(words.sun, [words.moon, words.book], 'read'),
        choose(words.moon, [words.pencil, words.sun], 'read'),
        choose(words.pencil, [words.moon, words.book], 'read'),
        trace(words.sun),
      ]),
      topic('instructions', 'Listen and Do', 'اِسْمَعِي وَافعَلِي', '🏫', 'Follow common teacher instructions and ask for water politely.', [words.sit, words.stand, words.open, words.listen], [say(words.want, 'Practice asking for water.'), say(words.please, 'Add this to say please.')]),
      makeLesson('phrases', 'I See a Cat!', 'أَرَى قِطَّةً', '💬', 'Speak in short phrases and greet a new classmate.', [
        show(words.seeCat), show(words.seeBird), show(words.thisBook), show(words.thisBag),
        choose(words.seeBird, [words.seeCat, words.thisBook], 'pictures'),
        choose(words.thisBag, [words.seeBird, words.thisBook], 'pictures'),
        say(words.how, 'Ask your grown-up how they are.'), say(words.well, 'Now take a turn answering.'),
      ]),
      makeLesson('story', 'A Story in the Garden', 'قِصَّةٌ فِي الْحَدِيقَة', '🌳', 'Listen to a short story, find details and retell it.', [
        show(words.above), show(words.below), story(gardenStory),
        choose(words.cat, [words.bird, words.tree], 'comprehension', { label: 'Who is under the tree?' }),
        choose(words.bird, [words.cat, words.dog], 'comprehension', { label: 'Who is above the tree?' }),
        say(words.seeCat, 'Tell a grown-up one thing you remember from the story.'),
      ]),
      makeLesson('ready', 'My School Day', 'يَوْمِي فِي الْمَدْرَسَة', '⭐', 'Review listening, speaking, early reading and writing.', [
        show(words.close), show(words.look),
        choose(words.open, [words.close, words.sit], 'pictures'),
        choose(words.pencil, [words.book, words.water], 'read'),
        choose(alphabet[21], [alphabet[1], alphabet[19]], 'sound', { text: words.book.ar, label: 'Which letter starts the word?' }),
        choose(alphabet[7], [alphabet[0], alphabet[13]], 'sound', { text: words.hand.ar, label: 'Which letter ends the word?' }),
        trace(words.hand), say(words.name, 'Say your name to your imaginary teacher.'),
      ]),
    ],
  },
];

export const games = [
  {
    id: 'picture-pick', title: 'Picture Pick', picture: '🎨', color: 'mint', description: 'Hear an Arabic word and tap its picture.',
    steps: [choose(words.apple, [words.banana, words.water], 'pictures'), choose(words.cat, [words.dog, words.bird], 'pictures'),
      choose(words.blue, [words.red, words.green], 'pictures'), choose(words.book, [words.pencil, words.bag], 'pictures'),
      choose(words.milk, [words.water, words.apple], 'pictures')],
  },
  {
    id: 'letter-hunt', title: 'Letter Hunt', picture: '🔎', color: 'peach', description: 'Listen for a letter, then spot its shape.',
    steps: [1, 2, 4, 11, 22, 23].map((index) => choose(alphabet[index], [alphabet[(index + 1) % 28], alphabet[(index + 3) % 28]])),
  },
  {
    id: 'counting', title: 'Counting Garden', picture: '🐝', color: 'lavender', description: 'Count the bees and tap the matching Arabic numeral.',
    steps: [words.one, words.two, words.three, words.four, words.five, words.six, words.seven, words.eight, words.nine, words.ten].map((item, index, numbers) =>
      choose(item, [numbers[(index + 2) % 10], numbers[(index + 1) % 10]], 'count', { quantity: index + 1, label: 'How many bees?' })),
  },
];

export const readiness = [
  { id: 'greetings', category: 'Speaking', title: 'Greet and introduce herself', detail: 'Role-play meeting a teacher. Can she greet you and say her name with a little prompting?', cue: words.name },
  { id: 'instructions', category: 'Listening', title: 'Follow a classroom instruction', detail: 'Say it once, pause, and see if she opens the book. Try a second familiar instruction on another day.', cue: words.open },
  { id: 'story', category: 'Listening', title: 'Recall one detail from a short story', detail: 'Replay A Story in the Garden. Ask her to point to the animal that was under the tree, then invite her to tell you what happened.', lesson: 'story' },
  { id: 'sound', category: 'Reading', title: 'Hear a first or last sound', detail: 'Ask for the first sound of this word. Then ask for the last sound. Let her answer aloud or point to the letter.', cue: words.book },
  { id: 'letters', category: 'Reading', title: 'Recognize familiar letters and vowel marks', detail: 'Mix up letter cards. Can she find ب and ت and tell the short sounds بَ and بِ apart?', cue: short[0] },
  { id: 'word', category: 'Reading', title: 'Read a few familiar vowelled words', detail: 'Write بَاب and قَمَر on paper. Invite her to point from right to left and try blending each word.', cue: words.door },
  { id: 'writing', category: 'Writing', title: 'Copy letters and try writing her name', detail: 'Use a pencil and paper. Show her how to start on the right and invite her to copy a few familiar letters and her Arabic name.', lesson: 'joins' },
];

export const lessons = stages.flatMap((stage) => stage.lessons.map((lesson, index) => ({ ...lesson, stage, number: index + 1 })));
export const audioExtras = [words.well, words.bread, words.orange, words.camel, words.bunny, words.next, words.inside];
