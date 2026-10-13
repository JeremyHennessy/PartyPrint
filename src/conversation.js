const common = ['Sweet treats or savory snacks?', 'A beach day or a forest walk?', 'Board games or karaoke?', 'A big celebration or a cozy gathering?', 'Plan ahead or be spontaneous?', 'Photos or handwritten notes?', 'Morning sunshine or evening stars?', 'Make it yourself or find it ready-made?', 'Music or a good story?', 'A surprise gift or a wish-list gift?', 'Dress up or keep it casual?', 'Try something new or enjoy an old favorite?'];
const special = {
  baby:['Tiny socks or tiny hats?', 'A lullaby or a bedtime story?', 'A handmade blanket or a baby book?', 'A teddy bear or a toy rabbit?'],
  bridal:['A garden ceremony or a beach ceremony?', 'A live band or a DJ?', 'Cake or a dessert table?', 'A handwritten vow or a favorite poem?'],
  birthday:['Cupcakes or a birthday cake?', 'A surprise party or a planned party?', 'Balloons or paper garlands?', 'A birthday brunch or a birthday dinner?'],
  office:['Coffee or tea?', 'A shared lunch or a team walk?', 'Brainstorm aloud or jot ideas first?', 'A desk plant or a desk photo?'],
  holiday:['Twinkling lights or candlelight?', 'Hot chocolate or warm cider?', 'Homemade cookies or a festive cake?', 'Gift wrapping or decorating?'],
  'game-night':['Cooperative games or friendly competition?', 'Cards or dice?', 'A quick round or a long adventure?', 'Strategy or a little luck?']
};
export function conversationPrompts(occasion) { return [...(special[occasion] || []), ...common]; }
