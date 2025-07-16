const mongoose = require('mongoose');
const Emoji = require('../models/Emoji');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Popular emojis data
const emojisData = [
  // Smileys & People
  { unicode: '😀', shortcode: ':grinning:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Grinning Face', tags: ['happy', 'smile', 'grin'], isPopular: true },
  { unicode: '😃', shortcode: ':smiley:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Grinning Face with Big Eyes', tags: ['happy', 'smile', 'joy'], isPopular: true },
  { unicode: '😄', shortcode: ':smile:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Grinning Face with Smiling Eyes', tags: ['happy', 'smile', 'laugh'], isPopular: true },
  { unicode: '😁', shortcode: ':grin:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Beaming Face with Smiling Eyes', tags: ['happy', 'smile', 'beam'], isPopular: true },
  { unicode: '😆', shortcode: ':laughing:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Grinning Squinting Face', tags: ['laugh', 'happy', 'satisfied'], isPopular: true },
  { unicode: '😅', shortcode: ':sweat_smile:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Grinning Face with Sweat', tags: ['laugh', 'sweat', 'relief'], isPopular: true },
  { unicode: '🤣', shortcode: ':rofl:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Rolling on the Floor Laughing', tags: ['laugh', 'lol', 'funny'], isPopular: true },
  { unicode: '😂', shortcode: ':joy:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Face with Tears of Joy', tags: ['laugh', 'cry', 'funny'], isPopular: true },
  { unicode: '🙂', shortcode: ':slightly_smiling_face:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Slightly Smiling Face', tags: ['smile', 'content', 'happy'], isPopular: true },
  { unicode: '🙃', shortcode: ':upside_down_face:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Upside-Down Face', tags: ['silly', 'funny', 'sarcasm'], isPopular: false },
  { unicode: '😉', shortcode: ':wink:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Winking Face', tags: ['wink', 'flirt', 'playful'], isPopular: true },
  { unicode: '😊', shortcode: ':blush:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Smiling Face with Smiling Eyes', tags: ['blush', 'happy', 'content'], isPopular: true },
  { unicode: '😇', shortcode: ':innocent:', category: 'smileys-people', subcategory: 'face-smiling', description: 'Smiling Face with Halo', tags: ['innocent', 'angel', 'halo'], isPopular: false },

  // Negative emotions
  { unicode: '😔', shortcode: ':pensive:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Pensive Face', tags: ['sad', 'thoughtful', 'pensive'], isPopular: true },
  { unicode: '😞', shortcode: ':disappointed:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Disappointed Face', tags: ['sad', 'disappointed', 'down'], isPopular: true },
  { unicode: '😢', shortcode: ':cry:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Crying Face', tags: ['cry', 'sad', 'tear'], isPopular: true },
  { unicode: '😭', shortcode: ':sob:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Loudly Crying Face', tags: ['cry', 'sob', 'sad'], isPopular: true },
  { unicode: '😤', shortcode: ':triumph:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Face with Steam From Nose', tags: ['angry', 'frustrated', 'mad'], isPopular: true },
  { unicode: '😠', shortcode: ':angry:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Angry Face', tags: ['angry', 'mad', 'annoyed'], isPopular: true },
  { unicode: '😡', shortcode: ':rage:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Pouting Face', tags: ['angry', 'rage', 'furious'], isPopular: true },

  // Love & affection
  { unicode: '🥰', shortcode: ':smiling_face_with_hearts:', category: 'smileys-people', subcategory: 'face-affection', description: 'Smiling Face with Hearts', tags: ['love', 'hearts', 'happy'], isPopular: true },
  { unicode: '😍', shortcode: ':heart_eyes:', category: 'smileys-people', subcategory: 'face-affection', description: 'Smiling Face with Heart-Eyes', tags: ['love', 'hearts', 'eyes'], isPopular: true },
  { unicode: '🤩', shortcode: ':star_struck:', category: 'smileys-people', subcategory: 'face-affection', description: 'Star-Struck', tags: ['stars', 'eyes', 'amazed'], isPopular: true },
  { unicode: '😘', shortcode: ':kissing_heart:', category: 'smileys-people', subcategory: 'face-affection', description: 'Face Blowing a Kiss', tags: ['kiss', 'heart', 'love'], isPopular: true },
  { unicode: '😗', shortcode: ':kissing:', category: 'smileys-people', subcategory: 'face-affection', description: 'Kissing Face', tags: ['kiss', 'lips'], isPopular: false },

  // Gestures
  { unicode: '👍', shortcode: ':thumbs_up:', category: 'smileys-people', subcategory: 'hand-fingers-open', description: 'Thumbs Up', tags: ['thumbs', 'up', 'good', 'yes'], isPopular: true },
  { unicode: '👎', shortcode: ':thumbs_down:', category: 'smileys-people', subcategory: 'hand-fingers-open', description: 'Thumbs Down', tags: ['thumbs', 'down', 'bad', 'no'], isPopular: true },
  { unicode: '👌', shortcode: ':ok_hand:', category: 'smileys-people', subcategory: 'hand-fingers-partial', description: 'OK Hand', tags: ['ok', 'hand', 'good'], isPopular: true },
  { unicode: '✌️', shortcode: ':victory_hand:', category: 'smileys-people', subcategory: 'hand-fingers-partial', description: 'Victory Hand', tags: ['victory', 'peace', 'two'], isPopular: true },
  { unicode: '🤞', shortcode: ':crossed_fingers:', category: 'smileys-people', subcategory: 'hand-fingers-partial', description: 'Crossed Fingers', tags: ['fingers', 'crossed', 'luck'], isPopular: true },
  { unicode: '🙏', shortcode: ':pray:', category: 'smileys-people', subcategory: 'hand-fingers-closed', description: 'Folded Hands', tags: ['pray', 'thanks', 'please'], isPopular: true },
  { unicode: '👏', shortcode: ':clap:', category: 'smileys-people', subcategory: 'hand-fingers-closed', description: 'Clapping Hands', tags: ['clap', 'applause', 'congratulations'], isPopular: true },

  // Hearts
  { unicode: '❤️', shortcode: ':heart:', category: 'symbols', subcategory: 'heart', description: 'Red Heart', tags: ['love', 'heart', 'red'], isPopular: true },
  { unicode: '🧡', shortcode: ':orange_heart:', category: 'symbols', subcategory: 'heart', description: 'Orange Heart', tags: ['love', 'heart', 'orange'], isPopular: false },
  { unicode: '💛', shortcode: ':yellow_heart:', category: 'symbols', subcategory: 'heart', description: 'Yellow Heart', tags: ['love', 'heart', 'yellow'], isPopular: true },
  { unicode: '💚', shortcode: ':green_heart:', category: 'symbols', subcategory: 'heart', description: 'Green Heart', tags: ['love', 'heart', 'green'], isPopular: true },
  { unicode: '💙', shortcode: ':blue_heart:', category: 'symbols', subcategory: 'heart', description: 'Blue Heart', tags: ['love', 'heart', 'blue'], isPopular: true },
  { unicode: '💜', shortcode: ':purple_heart:', category: 'symbols', subcategory: 'heart', description: 'Purple Heart', tags: ['love', 'heart', 'purple'], isPopular: true },
  { unicode: '🖤', shortcode: ':black_heart:', category: 'symbols', subcategory: 'heart', description: 'Black Heart', tags: ['love', 'heart', 'black'], isPopular: false },
  { unicode: '🤍', shortcode: ':white_heart:', category: 'symbols', subcategory: 'heart', description: 'White Heart', tags: ['love', 'heart', 'white'], isPopular: false },
  { unicode: '💔', shortcode: ':broken_heart:', category: 'symbols', subcategory: 'heart', description: 'Broken Heart', tags: ['broken', 'heart', 'sad'], isPopular: true },

  // Animals & Nature
  { unicode: '🐶', shortcode: ':dog:', category: 'animals-nature', subcategory: 'animal-mammal', description: 'Dog Face', tags: ['dog', 'animal', 'pet'], isPopular: true },
  { unicode: '🐱', shortcode: ':cat:', category: 'animals-nature', subcategory: 'animal-mammal', description: 'Cat Face', tags: ['cat', 'animal', 'pet'], isPopular: true },
  { unicode: '🦄', shortcode: ':unicorn:', category: 'animals-nature', subcategory: 'animal-mammal', description: 'Unicorn', tags: ['unicorn', 'magical', 'fantasy'], isPopular: true },
  { unicode: '🌟', shortcode: ':star2:', category: 'travel-places', subcategory: 'sky-weather', description: 'Glowing Star', tags: ['star', 'glowing', 'bright'], isPopular: true },
  { unicode: '⭐', shortcode: ':star:', category: 'travel-places', subcategory: 'sky-weather', description: 'Star', tags: ['star', 'rating'], isPopular: true },
  { unicode: '🌈', shortcode: ':rainbow:', category: 'travel-places', subcategory: 'sky-weather', description: 'Rainbow', tags: ['rainbow', 'colors', 'weather'], isPopular: true },

  // Food & Drink
  { unicode: '🍕', shortcode: ':pizza:', category: 'food-drink', subcategory: 'food-prepared', description: 'Pizza', tags: ['pizza', 'food', 'italian'], isPopular: true },
  { unicode: '🍔', shortcode: ':hamburger:', category: 'food-drink', subcategory: 'food-prepared', description: 'Hamburger', tags: ['burger', 'food', 'fast'], isPopular: true },
  { unicode: '🍟', shortcode: ':fries:', category: 'food-drink', subcategory: 'food-prepared', description: 'French Fries', tags: ['fries', 'food', 'fast'], isPopular: true },
  { unicode: '🍰', shortcode: ':cake:', category: 'food-drink', subcategory: 'food-sweet', description: 'Shortcake', tags: ['cake', 'dessert', 'sweet'], isPopular: true },
  { unicode: '🎂', shortcode: ':birthday:', category: 'food-drink', subcategory: 'food-sweet', description: 'Birthday Cake', tags: ['birthday', 'cake', 'celebration'], isPopular: true },
  { unicode: '☕', shortcode: ':coffee:', category: 'food-drink', subcategory: 'drink', description: 'Hot Beverage', tags: ['coffee', 'drink', 'hot'], isPopular: true },
  { unicode: '🍺', shortcode: ':beer:', category: 'food-drink', subcategory: 'drink', description: 'Beer Mug', tags: ['beer', 'drink', 'alcohol'], isPopular: true },

  // Activities
  { unicode: '⚽', shortcode: ':soccer:', category: 'activities', subcategory: 'sport', description: 'Soccer Ball', tags: ['soccer', 'football', 'sport'], isPopular: true },
  { unicode: '🏀', shortcode: ':basketball:', category: 'activities', subcategory: 'sport', description: 'Basketball', tags: ['basketball', 'sport', 'ball'], isPopular: true },
  { unicode: '🎉', shortcode: ':tada:', category: 'activities', subcategory: 'event', description: 'Party Popper', tags: ['party', 'celebration', 'congratulations'], isPopular: true },
  { unicode: '🎊', shortcode: ':confetti_ball:', category: 'activities', subcategory: 'event', description: 'Confetti Ball', tags: ['confetti', 'party', 'celebration'], isPopular: true },
  { unicode: '🎁', shortcode: ':gift:', category: 'activities', subcategory: 'event', description: 'Gift', tags: ['gift', 'present', 'box'], isPopular: true },

  // Objects
  { unicode: '📱', shortcode: ':iphone:', category: 'objects', subcategory: 'phone', description: 'Mobile Phone', tags: ['phone', 'mobile', 'cell'], isPopular: true },
  { unicode: '💻', shortcode: ':computer:', category: 'objects', subcategory: 'computer', description: 'Laptop', tags: ['computer', 'laptop', 'technology'], isPopular: true },
  { unicode: '🔥', shortcode: ':fire:', category: 'objects', subcategory: 'other-object', description: 'Fire', tags: ['fire', 'hot', 'flame'], isPopular: true },
  { unicode: '💯', shortcode: ':100:', category: 'symbols', subcategory: 'other-symbol', description: 'Hundred Points', tags: ['100', 'perfect', 'score'], isPopular: true },

  // Symbols
  { unicode: '✅', shortcode: ':white_check_mark:', category: 'symbols', subcategory: 'other-symbol', description: 'Check Mark Button', tags: ['check', 'mark', 'yes'], isPopular: true },
  { unicode: '❌', shortcode: ':x:', category: 'symbols', subcategory: 'other-symbol', description: 'Cross Mark', tags: ['x', 'cross', 'no'], isPopular: true },
  { unicode: '⚡', shortcode: ':zap:', category: 'travel-places', subcategory: 'sky-weather', description: 'High Voltage', tags: ['lightning', 'zap', 'electric'], isPopular: true },
  { unicode: '💥', shortcode: ':boom:', category: 'symbols', subcategory: 'other-symbol', description: 'Collision', tags: ['boom', 'explosion', 'crash'], isPopular: true },

  // More popular ones
  { unicode: '🤔', shortcode: ':thinking:', category: 'smileys-people', subcategory: 'face-hand', description: 'Thinking Face', tags: ['thinking', 'hmm', 'consider'], isPopular: true },
  { unicode: '🙄', shortcode: ':roll_eyes:', category: 'smileys-people', subcategory: 'face-neutral-skeptical', description: 'Face with Rolling Eyes', tags: ['roll', 'eyes', 'annoyed'], isPopular: true },
  { unicode: '😴', shortcode: ':sleeping:', category: 'smileys-people', subcategory: 'face-sleepy', description: 'Sleeping Face', tags: ['sleep', 'tired', 'zzz'], isPopular: true },
  { unicode: '🤤', shortcode: ':drooling_face:', category: 'smileys-people', subcategory: 'face-sleepy', description: 'Drooling Face', tags: ['drool', 'hungry', 'want'], isPopular: false },
  { unicode: '🥺', shortcode: ':pleading_face:', category: 'smileys-people', subcategory: 'face-concerned', description: 'Pleading Face', tags: ['pleading', 'puppy', 'eyes'], isPopular: true },
  { unicode: '🎶', shortcode: ':notes:', category: 'symbols', subcategory: 'other-symbol', description: 'Musical Notes', tags: ['music', 'notes', 'song'], isPopular: true },
  { unicode: '🌍', shortcode: ':earth_africa:', category: 'travel-places', subcategory: 'place-map', description: 'Globe Showing Europe-Africa', tags: ['earth', 'world', 'globe'], isPopular: true }
];

async function populateEmojis() {
  try {
    console.log('Starting emoji population...');

    // Clear existing emojis
    await Emoji.deleteMany({});
    console.log('Cleared existing emojis');

    // Insert new emojis
    const result = await Emoji.insertMany(emojisData);
    console.log(`Successfully inserted ${result.length} emojis`);

    // Create indexes
    await Emoji.createIndexes();
    console.log('Created indexes');

    console.log('Emoji population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating emojis:', error);
    process.exit(1);
  }
}

// Run the script
populateEmojis();
