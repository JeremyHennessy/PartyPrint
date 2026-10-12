// Curated, original gameplay content. Nothing is fetched from a server.
export const OCCASIONS = [
  { id: "baby", label: "Baby shower", symbol: "✿", subtitle: "Sweet little moments", featured: true },
  { id: "bridal", label: "Bridal shower", symbol: "♡", subtitle: "Love & laughter", featured: true },
  { id: "birthday", label: "Birthday party", symbol: "✳", subtitle: "Make a wish", featured: true },
  { id: "office", label: "Office party", symbol: "✦", subtitle: "Team together", featured: false },
  { id: "holiday", label: "Holiday party", symbol: "❋", subtitle: "Cozy celebrations", featured: false },
  { id: "game-night", label: "Game night", symbol: "◆", subtitle: "Let the games begin", featured: false }
];

export const THEMES = [
  { id: "peach", label: "Peachy", swatch: "#f5bda8", ink: "#8c4c3e", tint: "#fff0e7" },
  { id: "sage", label: "Garden", swatch: "#acbc9c", ink: "#45614a", tint: "#f2f6ea" },
  { id: "lilac", label: "Lilac", swatch: "#c8b6e7", ink: "#62517f", tint: "#f5f0ff" },
  { id: "blue", label: "Blue sky", swatch: "#aacfe4", ink: "#42647a", tint: "#eff8ff" }
];

const universalBingo = [
  "Someone takes a group photo", "A guest tells a funny story", "Someone says 'cheers'",
  "A person arrives early", "Someone asks for the playlist", "A guest wears something sparkly",
  "Someone compliments the decorations", "A guest takes a selfie", "Someone talks about the weather",
  "An old memory gets shared", "A guest makes everyone laugh", "Someone says 'remember when'",
  "A guest asks for a recipe", "Someone starts dancing", "A person mentions their pet",
  "Two people discover something in common", "Someone spills a tiny bit of a drink",
  "A guest talks about a trip", "Someone offers to help clean up", "A guest makes a toast",
  "Someone brings a surprise", "A guest asks where something came from",
  "Someone says 'this is so cute'", "A person loses their phone for a moment",
  "Someone gives a heartfelt compliment", "A guest asks what time it is",
  "Someone photographs the food", "Someone starts a conversation with a stranger",
  "Someone points out a favorite song", "Someone says 'one more photo'",
  "A guest checks the snack table", "Someone laughs so hard they snort",
  "Someone uses an inside joke", "A guest offers another person a seat",
  "Someone says 'I love this'", "A guest shares good news"
];

const specificBingo = {
  baby: [
    "Someone says 'adorable'", "The word 'diapers' comes up", "A guest guesses the due date",
    "Someone mentions tiny socks", "A guest talks about baby names", "Someone says 'so little'",
    "A guest shares parenting advice", "Someone mentions a stroller", "A guest guesses the baby's hair color",
    "Someone says 'sleep while you can'", "A guest spots something yellow", "Someone mentions a lullaby",
    "A gift has a bow", "Someone says 'bundle of joy'", "A guest mentions a teddy bear",
    "Someone guesses the baby's first word", "A guest brings a book", "Someone says 'congratulations'"
  ],
  bridal: [
    "Someone says 'the big day'", "A guest asks about the honeymoon", "Someone mentions the dress",
    "A guest tells a love story", "Someone asks about the first dance", "A guest says 'beautiful'",
    "Someone talks about flowers", "A person mentions the venue", "A guest mentions a wedding cake",
    "Someone says 'something blue'", "A guest asks about the vows", "Someone mentions a bouquet",
    "A guest offers marriage advice", "Someone discusses the guest list", "A person says 'I do'",
    "Someone mentions a proposal", "Someone talks about a wedding song", "A guest spots a heart"
  ],
  birthday: [
    "Someone asks about the cake", "A guest sings part of a birthday song", "Someone says 'another year'",
    "A candle gets lit", "Someone mentions a birthday wish", "A guest takes a cake photo",
    "Someone asks how old the guest of honor is", "A guest gives a birthday hug",
    "Someone mentions balloons", "A present gets unwrapped", "Someone says 'make a wish'",
    "A guest tells a childhood story", "Someone asks for another slice", "A guest brings a card",
    "Someone says 'best birthday ever'", "Someone suggests a group picture"
  ],
  office: [
    "Someone says 'quick question'", "A person talks about the weekend", "Someone mentions a deadline",
    "A guest tells a work-safe joke", "Someone asks about the next vacation", "A guest shares a win",
    "Someone says 'calendar invite'", "A person mentions coffee", "Someone tells an office story",
    "A guest introduces two coworkers", "Someone uses a workplace acronym", "A person mentions a meeting",
    "Someone says 'team effort'", "A coworker takes a group photo", "Someone asks about the snacks",
    "A person thanks a teammate", "Someone says 'great job'", "Someone shares a hobby"
  ],
  holiday: [
    "Someone mentions a family tradition", "A guest talks about holiday lights", "Someone asks for hot cocoa",
    "A festive song starts playing", "A guest talks about gift wrapping", "Someone compliments a sweater",
    "A guest mentions a favorite cookie", "Someone says 'cozy'", "A person asks about travel plans",
    "Someone tells a winter story", "A guest mentions a favorite movie", "Someone talks about decorations",
    "A person wears something red", "Someone mentions a favorite dessert", "A guest gives a small gift",
    "Someone says 'happy holidays'", "A guest takes a photo of the table", "Someone hums a seasonal tune"
  ],
  "game-night": [
    "Someone says 'your turn'", "A guest asks for the rules again", "Someone wins a round",
    "A dramatic comeback happens", "Someone says 'that's not fair'", "A guest starts a new game",
    "Someone rolls a lucky number", "A player changes their strategy", "Someone cheers for a friend",
    "A tie happens", "Someone says 'one more round'", "A guest makes a risky move",
    "A player asks for a rematch", "Someone guesses correctly", "A player laughs at their mistake",
    "Someone offers a high five", "A surprise winner emerges", "Someone loses track of the score"
  ]
};

const universalScavenger = [
  "Something with a heart on it", "Something that makes a sound", "Something with a fun texture",
  "An item with a number", "Something smaller than a coin", "Something that smells nice",
  "An object in your favorite color", "Something with a pattern", "A handwritten word",
  "Something made of paper", "An item with a circle", "Something that feels soft",
  "Something used to celebrate", "Something that sparkles", "A tiny decoration",
  "Something that makes you smile"
];
const specificScavenger = {
  baby: ["A tiny sock", "A picture of an animal", "Something pastel", "A baby book", "Something with stars", "A ribbon"],
  bridal: ["A flower", "A ribbon", "A ring-shaped object", "Something borrowed", "A little bit of lace", "A photo of a couple"],
  birthday: ["A candle", "A balloon", "A birthday card", "A piece of confetti", "A wrapped gift", "Something in the birthday person's favorite color"],
  office: ["A sticky note", "A pen in a bright color", "A paper clip", "An office plant", "Something branded", "A coffee cup"],
  holiday: ["A twinkling light", "A festive ribbon", "A snowflake shape", "Something cozy", "A seasonal ornament", "A gift tag"],
  "game-night": ["A game piece", "A die", "A playing card", "A scorecard", "A timer", "Something with a rule printed on it"]
};

const sharedTrivia = [
  ["How many sides does a hexagon have?", "Six"],
  ["What color do blue and yellow make when mixed as paint?", "Green"],
  ["Which planet is known as the Red Planet?", "Mars"],
  ["In which sport would you use a shuttlecock?", "Badminton"],
  ["What is the largest ocean on Earth?", "Pacific Ocean"],
  ["Which instrument has black and white keys?", "Piano"],
  ["How many days are in a leap year?", "366"],
  ["What is the name for a baby frog?", "Tadpole"],
  ["What is the first letter of the Greek alphabet?", "Alpha"],
  ["How many minutes are in two hours?", "120"],
  ["Which animal is known for its black-and-white stripes?", "Zebra"],
  ["What is the capital of France?", "Paris"],
  ["Which shape has three sides?", "Triangle"],
  ["What is the opposite of 'north'?", "South"]
];

const themedTrivia = {
  baby: [
    ["What is a baby kangaroo called?", "Joey"],
    ["What is a baby sheep called?", "Lamb"],
    ["Which word describes a group of kittens born together?", "Litter"],
    ["What do you call a young horse?", "Foal"],
    ["What is a baby goat called?", "Kid"],
    ["Which bird is commonly used in baby-delivery folklore?", "Stork"],
    ["What is a young cow called?", "Calf"],
    ["What is a baby swan called?", "Cygnet"],
    ["What do baby caterpillars usually become?", "Butterflies or moths"],
    ["What is a baby dog called?", "Puppy"],
    ["What is a baby duck called?", "Duckling"],
    ["What is a baby pig called?", "Piglet"]
  ],
  bridal: [
    ["What is the traditional name for a couple's first year of marriage anniversary?", "Paper anniversary"],
    ["What gemstone is traditionally associated with a 60th wedding anniversary?", "Diamond"],
    ["In which month is Valentine's Day?", "February"],
    ["What is the classic shape used to symbolize love?", "Heart"],
    ["What do you call a small bouquet worn on the wrist?", "Corsage"],
    ["What is another word for a wedding meal or celebration after the ceremony?", "Reception"],
    ["Which hand typically wears an engagement ring in Canada and the US?", "Left hand"],
    ["What is the traditional name for a 25th wedding anniversary?", "Silver anniversary"],
    ["What is the name of a formal spoken promise during a wedding?", "Vow"],
    ["What is the term for the flowers carried by a bride?", "Bouquet"],
    ["What is the name for the people standing with a couple during a ceremony?", "Wedding party"],
    ["What is the traditional name for a 50th wedding anniversary?", "Golden anniversary"]
  ],
  birthday: [
    ["How many candles would traditionally mark a 10th birthday?", "Ten"],
    ["What is the birthstone for April?", "Diamond"],
    ["What is the birthstone for July?", "Ruby"],
    ["What zodiac sign follows Leo?", "Virgo"],
    ["How many months make up one year?", "Twelve"],
    ["Which song is traditionally sung before blowing out birthday candles?", "Happy Birthday to You"],
    ["What is the birth flower commonly associated with March?", "Daffodil"],
    ["How many years make a decade?", "Ten"],
    ["Which month has an extra day during a leap year?", "February"],
    ["What is the traditional gemstone for a 40th anniversary?", "Ruby"],
    ["What is the birthstone for September?", "Sapphire"],
    ["What is the birthstone for May?", "Emerald"]
  ],
  office: [
    ["What does 'PDF' stand for?", "Portable Document Format"],
    ["What does 'CC' commonly stand for in email?", "Carbon copy"],
    ["How many hours are in two workdays of eight hours each?", "16"],
    ["What does 'FAQ' stand for?", "Frequently Asked Questions"],
    ["What key is commonly used to start a new line when typing?", "Enter or Return"],
    ["What does 'URL' stand for?", "Uniform Resource Locator"],
    ["What is the common name for a 15-minute team check-in?", "Stand-up"],
    ["Which symbol is used in every standard email address?", "@"],
    ["What does 'RSVP' request?", "A reply about attendance"],
    ["What does 'Wi-Fi' refer to in everyday usage?", "Wireless networking"],
    ["What does 'FYI' stand for?", "For your information"],
    ["Which weekday comes immediately before Friday?", "Thursday"]
  ],
  holiday: [
    ["How many sides does a typical snowflake's symmetry have?", "Six"],
    ["What warm winter drink is commonly made with cocoa powder?", "Hot chocolate"],
    ["What is the last month of the calendar year?", "December"],
    ["What type of tree is evergreen: pine or maple?", "Pine"],
    ["What is the shortest day of the year in the Northern Hemisphere near December called?", "Winter solstice"],
    ["What is the common name for a decoration made from woven greenery and hung on a door?", "Wreath"],
    ["What is another name for a long decorative string of greenery?", "Garland"],
    ["How many points does a classic five-point star have?", "Five"],
    ["What is frozen water called?", "Ice"],
    ["Which hemisphere has summer in December?", "Southern Hemisphere"],
    ["How many days are in December?", "31"],
    ["What does a calendar count down?", "Days or time"]
  ],
  "game-night": [
    ["How many faces does a standard six-sided die have?", "Six"],
    ["How many squares are on a chessboard?", "64"],
    ["How many suits are in a standard 52-card deck?", "Four"],
    ["In chess, which piece moves in an L shape?", "Knight"],
    ["What color are the two opposite sides in a traditional game of checkers?", "Red and black"],
    ["What is the highest face value card in many standard games?", "Ace"],
    ["How many players are on a tic-tac-toe board at one time?", "Two"],
    ["How many dots are on the number-six face of a standard die?", "Six"],
    ["What is the term for a tied game?", "Draw"],
    ["Which board game features the phrase 'Go to Jail'?", "Monopoly"],
    ["How many rows are in a classic 3-by-3 tic-tac-toe grid?", "Three"],
    ["In a standard deck, what suit uses a black spade symbol?", "Spades"]
  ]
};

export function occasionById(id) {
  return OCCASIONS.find(item => item.id === id) || OCCASIONS[0];
}

export function themeById(id) {
  return THEMES.find(item => item.id === id) || THEMES[0];
}

export function getBingoPrompts(id) {
  return [...specificBingo[id] || [], ...universalBingo];
}

export function getScavengerPrompts(id) {
  return [...specificScavenger[id] || [], ...universalScavenger];
}

export function getTriviaQuestions(id) {
  return [...(themedTrivia[id] || []), ...sharedTrivia]
    .map(([question, answer]) => ({ question, answer }));
}
