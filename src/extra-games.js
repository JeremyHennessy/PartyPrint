const questions = ["What is their favorite food?", "What is their favorite color?", "Which song always makes them smile?", "What is their favorite movie?", "What is their ideal day off?", "Which hobby do they enjoy most?", "What is their favorite dessert?", "Where would they love to travel?", "What is their favorite season?", "Which animal would they choose as a pet?"];
const occasionQuestions = {
  baby: ["Which bedtime story would they choose?", "What baby gift would they find most useful?"],
  bridal: ["What is their ideal date night?", "Which celebration detail matters most to them?"],
  birthday: ["What is their favorite birthday tradition?", "What would they choose for a birthday treat?"],
  office: ["What is their favorite workday snack?", "Do they prefer a quiet break or a team chat?"],
  holiday: ["What is their favorite festive treat?", "Which holiday tradition do they enjoy most?"],
  "game-night": ["What is their favorite board game?", "Do they prefer teamwork or friendly competition?"]
};
export function honorQuestions(occasion) { return [...questions, ...(occasionQuestions[occasion] || occasionQuestions.birthday)]; }
const words = {
  baby: "DIAPERS BLANKET BOTTLE PACIFIER STROLLER CRADLE RATTLE BOOTIES NURSERY ONESIE LULLABY BIBS TEDDY WIPES CUDDLES MOBILE",
  bridal: "BOUQUET FLOWERS RIBBON RINGS VOWS TOAST DRESS MUSIC DANCING INVITATION CONFETTI CELEBRATION CAKE LOVE FRIENDS GARLAND",
  birthday: "BALLOONS CANDLES PRESENTS CONFETTI CUPCAKES WISHES FRIENDS MUSIC DANCING RIBBON PARTY GAMES CAKE FROSTING STREAMERS CELEBRATE",
  office: "TEAMWORK COFFEE MEETING CALENDAR PENCIL NOTEBOOK PROJECT BREAK LUNCH IDEAS DESK PLANNER SNACKS COLLEAGUE KEYBOARD PRESENTATION",
  holiday: "GARLAND LIGHTS COOKIES COCOA RIBBON GIFTS CANDLES FEAST FRIENDS FAMILY CELEBRATE SPARKLE DECORATION MUSIC GATHERING KINDNESS",
  "game-night": "DICE CARDS TOKENS PUZZLE STRATEGY TEAMWORK SCOREBOARD TIMER WINNER ROUND SHUFFLE PLAYERS CHALLENGE CLUES BOARD PIECES"
};
export function scrambleWords(occasion) { return (words[occasion] || words.birthday).split(" "); }
const drawingCommon = ["A dancing pineapple", "A cat wearing a crown", "A bicycle with balloons", "A robot making pancakes", "A smiling moon", "A very tall sandwich", "An umbrella in the sunshine", "A dog on a skateboard", "A tiny castle", "A giant birthday cake", "An octopus playing drums", "A flying teacup"];
const drawingSpecial = {
  baby: ["A teddy bear", "A baby stroller", "A pile of tiny socks", "A sleepy elephant", "A rocking horse", "A rubber duck"],
  bridal: ["A flower bouquet", "A wedding cake", "A pair of dancing shoes", "A garden arch", "A heart-shaped balloon", "A fancy hat"],
  birthday: ["A surprise present", "A party hat", "A balloon animal", "A cupcake tower", "A candle parade", "A confetti shower"],
  office: ["A coffee break", "A wobbly desk chair", "A mountain of sticky notes", "A team picnic", "A busy keyboard", "A cheerful desk plant"],
  holiday: ["A string of lights", "A wrapped gift", "A mug of cocoa", "A cookie house", "A festive garland", "A sparkling candle"],
  "game-night": ["A giant pair of dice", "A tower of game pieces", "A puzzle with one piece missing", "A deck of cards", "A trophy", "A very slow timer"]
};
export function drawingPrompts(occasion) { return [...(drawingSpecial[occasion] || []), ...drawingCommon]; }
