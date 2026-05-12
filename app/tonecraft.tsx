import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── WORD BANK ────────────────────────────────────────────────────────────────
const WORD_BANK: Record<string, { perfect: string[]; good: string[]; basic: string[] }> = {
  dramatic: {
    perfect: [
      'catastrophic','devastating','earth-shattering','cataclysmic','harrowing',
      'tumultuous','monumental','staggering','overwhelming','apocalyptic',
      'ruinous','dread-inducing','world-ending','life-altering','shocking',
      'unprecedented','disastrous','calamitous','tragedy-stricken','violent',
      'explosive','seismic','shattering','crippling','gut-wrenching',
      'bone-chilling','soul-crushing','paralyzing','torrential','unrelenting',
      'catastrophic-scale','epoch-defining','earth-rending','devastation-level',
      'apocalypse-like','system-collapsing','reality-shattering','existence-ending',
      'world-altering','civilization-breaking','irreversible','unstoppable',
      'overpowering','breakdown-inducing','collapse-driven','impactful-to-the-core'
    ],
    good: [
      'terrible','horrible','dreadful','alarming','intense',
      'severe','critical','serious','grave','worrying',
      'disturbing','painful','harsh','stressful','chaotic',
      'troubling','frightening','dangerous','unstable','fierce',
      'drastic','extreme','wild','major','significant',
      'enormous','massive','heavy','urgent','escalating',
      'rough','turbulent','pressurized','strained','volatile',
      'tense','unsettling','alarming-level','high-stakes','risk-heavy',
      'emotionally-charged','fast-moving','breaking','critical-level','heightened',
      'serious-toned','impact-heavy','danger-laden','unstable-situation','distressing'
    ],
    basic: [
      'bad','awful','hard','tough','rough',
      'sad','difficult','unfortunate','upsetting','dark',
      'messy','ugly','poor','wrong','weak',
      'grim','off','low','not great','unpleasant',
      'badly','hardly','barely','mess','problematic',
      'inconvenient','meh','subpar','lacking','inferior',
      'negative','down','poorly','struggling','flawed'
    ],
  },
  formal: {
    perfect: [
      'distinguished','esteemed','authoritative','eloquent','sophisticated',
      'refined','dignified','ceremonious','decorous','stately',
      'impeccable','illustrious','prestigious','erudite','cultivated',
      'meticulous','scholarly','polished','venerable','accomplished',
      'eminent','revered','astute','composed','judicious',
      'magnanimous','articulate','discerning','immaculate','laudable',
      'august','noble','grandiloquent','high-minded','rhetorical',
      'sage','learned','intellectual','thoughtful','analytical',
      'exemplary','commanding','regal','principled','masterful',
      'admirable','noteworthy','well-regarded','upright','civilized'
    ],
    good: [
      'professional','proper','composed','measured','precise',
      'respected','poised','structured','clear','disciplined',
      'organized','credible','serious','capable','qualified',
      'efficient','focused','prepared','logical','confident',
      'strong','reliable','experienced','skilled','thorough',
      'competent','balanced','orderly','articulate','steady',
      'consistent','controlled','responsible','respectful','formal',
      'systematic','reasonable','capable-minded','well-prepared','effective',
      'accurate','reputable','sound','deliberate','coherent'
    ],
    basic: [
      'nice','good','neat','clean','calm',
      'smart','fine','steady','correct','ok',
      'decent','simple','plain','normal','fair',
      'okay','average','basic','standard','okayish',
      'polite','okay-level','acceptable','passable','mild',
      'ordinary','regular','typical','safe','neutral'
    ],
  },
  sad: {
    perfect: [
      'devastated','heartbroken','inconsolable','despairing','bereft',
      'anguished','mournful','sorrowful','wretched','desolate',
      'crushed','grief-stricken','shattered','tormented','broken',
      'hopeless','distraught','forsaken','melancholic','lamenting',
      'despondent','bereaved','crestfallen','woeful','forlorn',
      'disconsolate','afflicted','agonized','dejected','somber',
      'ruined','devastated-to-the-core','emotionally-broken','spirit-crushed','utterly-heartbroken',
      'life-shattered','grief-laden','pain-ridden','tear-ravaged','loss-stricken',
      'emptiness-consumed','hopelessly-lost','broken-hearted','anguish-filled','soul-broken',
      'irreparably-damaged','emotionally-destroyed','deeply-mourning','sorrow-drenched','pain-devoured'
    ],
    good: [
      'miserable','gloomy','melancholy','grieving','distressed',
      'troubled','downcast','somber','heavy-hearted','tearful',
      'lonely','regretful','disappointed','empty','hurt',
      'unhappy','blue','low','bitter','resigned',
      'lost','weary','broken','pained','sullen',
      'hurtful','stressed','downhearted','unsettled','emotionally-low',
      'sad-looking','depressed','hurt-feeling','withdrawn','troubled-mind',
      'weakened','deflated','discouraged','drained','low-spirited'
    ],
    basic: [
      'upset','unhappy','down','bad','grim',
      'blue','glum','meh','off','tired',
      'weak','flat','rough','sad','hurt',
      'low','downer','blah','not-good','unwell',
      'meh-feeling','slightly-sad','kind-of-bad','off-feeling','low-energy'
    ],
  },
  positive: {
    perfect: [
      'exhilarating','triumphant','magnificent','extraordinary','sensational',
      'spectacular','phenomenal','radiant','breathtaking','transcendent',
      'glorious','stunning','unparalleled','masterful','brilliant',
      'exceptional','supreme','electrifying','uplifting','astounding',
      'awe-inspiring','incomparable','marvelous','resplendent','dazzling',
      'luminous','miraculous','legendary','iconic','unforgettable',
      'euphoric','joy-exploding','limitless','jaw-dropping','mind-blowing',
      'celebratory','victorious','overjoyed','blissful','elated',
      'peak-performance','gold-standard','heavenly','perfected','flawless',
      'radiance-filled','life-affirming','soul-lifting','world-class','next-level'
    ],
    good: [
      'wonderful','excellent','fantastic','outstanding','remarkable',
      'impressive','inspiring','joyful','amazing','strong',
      'solid','awesome','cheerful','lovely','pleasing',
      'successful','energetic','vibrant','dynamic','powerful',
      'effective','impactful','meaningful','memorable','great',
      'pleasant','happy','bright','positive','optimistic',
      'upbeat','encouraging','satisfying','warm','friendly',
      'supportive','motivated','confident','capable','capable-performing',
      'well-done','good-quality','high-level','strong-performing','well-balanced'
    ],
    basic: [
      'good','nice','fine','happy','fun',
      'glad','bright','warm','cool','ok',
      'decent','better','solid','easy','light',
      'okay','okayish','alright','pleasant','fair',
      'simple','clean','soft','friendly','mild',
      'basic-positive','slightly-good','pretty-good','not-bad','okay-feeling'
    ],
  },
  negative: {
    perfect: [
      'despicable','deplorable','abhorrent','contemptible','reprehensible',
      'egregious','atrocious','heinous','nefarious','vile',
      'monstrous','corrosive','malevolent','sinister','odious',
      'repugnant','loathsome','diabolical','wicked','barbaric',
      'insidious','treacherous','corrupt','venomous','predatory',
      'savage','ruthless','destructive','toxic','malicious',
      'abominable','dreadful','horrific','unforgivable','unspeakable',
      'heinous-level','evil-spiraled','morally-bankrupt','soul-corrupting','systemically-evil',
      'utterly-repulsive','deeply-corrupt','morally-depraved','psychologically-damaging','cruelty-driven',
      'inhumane','brutalizing','devastation-causing','malice-filled','hate-fueled'
    ],
    good: [
      'terrible','dreadful','appalling','disgraceful','shameful',
      'hostile','cruel','toxic','aggressive','unfair',
      'dirty','nasty','cold','brutal','harsh',
      'wrong','unjust','destructive','harmful','damaging',
      'reckless','irresponsible','negligent','dishonest','corrupt',
      'negative','hurtful','painful','unpleasant','dangerous',
      'unstable','offensive','problematic','stressful','agitated',
      'conflicted','tense','unethical','low-quality','badly-handled'
    ],
    basic: [
      'bad','wrong','mean','rude','ugly',
      'dark','cold','rough','off','poor',
      'messy','fake','dirty','weak','low',
      'awful','meh','not-good','okay-bad','unpleasant',
      'average-bad','simple-bad','slightly-bad','kind-of-bad','off-feeling'
    ],
  },
  urgent: {
    perfect: [
      'imperative','indispensable','paramount','compelling','exigent',
      'critical','desperate','pressing','dire','momentous',
      'vital','nonnegotiable','immediate','crucial','decisive',
      'life-or-death','time-sensitive','mandatory','essential','unavoidable',
      'uncompromising','inescapable','emergency','high-priority','acute',
      'noncompliance-free','deadline-driven','last-chance','non-deferrable','absolute',
      'urgent-level','breaking-point','catastrophic-timing','seconds-count','zero-delay',
      'must-act-now','instant-required','priority-one','mission-critical','system-critical',
      'no-delay-possible','failure-risk','rapid-response','immediate-action','critical-window',
      'time-lock','final-warning','deadline-imminent','emergency-level','unstoppable-need'
    ],
    good: [
      'essential','serious','important','necessary','significant',
      'grave','alarming','needed','required','key',
      'fast','rapid','priority','high-stakes','tight',
      'quick','prompt','pressing','demanding','critical',
      'time-critical','short-deadline','overdue','undelayable','pressing',
      'urgent','fast-moving','time-sensitive','high-priority','alert',
      'rushed','accelerated','priority-based','important-level','needs-attention',
      'quick-turnaround','soon-needed','expedited','active','focused'
    ],
    basic: [
      'needed','fast','quick','soon','now',
      'main','real','big','major','rush',
      'hurry','stop','go','move','act',
      'asap','today','immediate','right-now','quickly',
      'short','brief','light','simple','basic-urgent'
    ],
  },
  hopeful: {
    perfect: [
      'promising','optimistic','auspicious','encouraging','heartening',
      'buoyant','luminous','restorative','rejuvenating','transformative',
      'radiant','uplifting','brightening','reassuring','visionary',
      'forward-looking','life-affirming','renewing','golden','revitalizing',
      'liberating','empowering','blossoming','flourishing','invigorating',
      'enlightening','healing','catalytic','regenerative','pioneering',
      'hope-filled','future-ready','breakthrough','turning-point','awakening',
      'reborn','resurgent','thriving','expanding','ascending',
      'sunlit','clear-sky','horizon-opening','possibility-rich','destiny-shaping',
      'uplift-driven','growth-defining','limit-breaking','path-forging','possibility-expanding',
      'new-era','positive-shift','life-changing-positive','dream-igniting','possibility-driven'
    ],
    good: [
      'inspiring','positive','reassuring','comforting','bright',
      'constructive','renewed','healing','supportive','better',
      'improving','strong','stable','safe','calm',
      'encouraged','motivated','cheerful','growing','rising',
      'recovering','progressing','building','advancing','opening',
      'hopeful','encouraging','steady','secure','balanced',
      'optimistic-leaning','forward-moving','gradual-growth','soft-improvement','positive-signs',
      'developing','strengthening','settling','easing','stabilizing'
    ],
    basic: [
      'good','nice','okay','better','fine',
      'glad','warm','safe','calm','clear',
      'hopeful','light','easy','soft','decent',
      'alright','okayish','not-bad','kind','simple',
      'mild','gentle','neutral','steady','basic-good'
    ],
  },
  angry: {
    perfect: [
      'incensed','infuriated','indignant','enraged','livid',
      'wrathful','furious','seething','irate','outraged',
      'fuming','vengeful','ferocious','explosive','burning',
      'aggrieved','volatile','ranting','rage-filled','bellicose',
      'hostile','combative','antagonistic','retaliatory','fierce',
      'escalating','confrontational','militant','unforgiving','unrelenting',
      'fury-driven','rage-consumed','anger-overflowing','temper-flaring','emotionally-volatile',
      'blind-rage','blood-boiling','rage-unstoppable','seething-mad','controlled-chaos',
      'venom-spitting','rage-fueled','detonation-ready','emotionally-explosive','rage-heavy',
      'warpath-level','conflict-driven','no-mercy','all-consuming-anger','unstable-fury'
    ],
    good: [
      'angry','frustrated','bitter','resentful','heated',
      'agitated','annoyed','irritated','mad','worked-up',
      'tense','upset','cross','snappy','sharp',
      'intense','inflamed','provoked','offended','disturbed',
      'bothered','riled','aggravated','stoked','charged',
      'irked','snappy-toned','emotionally-hot','triggered','tense-minded',
      'on-edge','slightly-raging','worked-up-state','heated-up','emotionally-reactive',
      'reactive','provoked-state','agitation-heavy','stress-activated','emotionally-pressed'
    ],
    basic: [
      'mad','upset','annoyed','cross','harsh',
      'mean','cold','sharp','tough','bad',
      'irritated','off','snappy','loud','short',
      'bothered','grumpy','moody','rough','offended',
      'slightly-mad','kind-of-angry','not-happy','low-temper','basic-angry'
    ],
  },
  peaceful: {
    perfect: [
      'serene','tranquil','harmonious','idyllic','placid',
      'ethereal','resplendent','celestial','sublime','meditative',
      'balanced','zen-like','luminous','still','flowing',
      'untroubled','pure','restorative','dreamlike','undisturbed',
      'pristine','wholesome','unblemished','crystalline','hushed',
      'sacred','blissful','graceful','timeless','gentle',
      'angelic','nirvana-like','stillness-filled','gravity-free','soft-lit',
      'moonlit-calm','horizon-still','breath-like','ocean-smooth','windless',
      'unbroken-calm','deep-stillness','pure-equilibrium','serenity-core','peace-absolute',
      'flow-state','silent-perfect','harmonic-balance','infinite-calm','unshaken'
    ],
    good: [
      'calming','soothing','quiet','restful','composed',
      'tender','soft','relaxed','easy','light',
      'steady','cool','fresh','clean','mild',
      'undisturbed','unruffled','unhurried','leisurely','smooth',
      'tranquil','comforting','reassuring','safe','warm',
      'peaceful','quieted','settled','balanced','low-stress',
      'softened','eased','gentle-flow','mellowed','slow-paced',
      'stable','non-chaotic','quiet-state','emotionally-calm','light-hearted-calm'
    ],
    basic: [
      'calm','nice','slow','easy','fine',
      'safe','light','clean','free','good',
      'quiet','soft','plain','simple','mellow',
      'okay','neutral','steady','still','okay-feeling',
      'low-energy','basic-calm','slightly-calm','not-loud','not-busy'
    ],
  },
  humorous: {
    perfect: [
      'hilarious','uproarious','sidesplitting','whimsical','farcical',
      'absurdist','comedic','satirical','witty','ludicrous',
      'rib-tickling','laugh-out-loud','ingenious','clever','zany',
      'offbeat','ironic','playfully-absurd','outrageous','madcap',
      'wacky','tongue-in-cheek','deadpan','irreverent','slapstick',
      'farcically-ridiculous','delightfully-odd','dryly-comic','absurdly-funny','cheeky',
      'comedy-gold','masterfully-funny','brilliantly-witty','comically-perfect','humor-rich',
      'laugh-uncontrollable','joke-level-genius','satire-heavy','comedy-driven','punchline-perfect',
      'timing-perfect','laugh-storm','comic-brilliance','witty-chaos','genius-humor',
      'next-level-funny','elevated-comedy','high-comedy','artful-humor','precision-comedy'
    ],
    good: [
      'funny','amusing','playful','silly','quirky',
      'ridiculous','comical','lighthearted','entertaining','cheerful',
      'goofy','odd','weird','joking','laughable',
      'fun','bright','witty','punny','chuckle-worthy',
      'snappy','bubbly','breezy','light','clever',
      'humorous','smiley','jovial','jokey','playful-tone',
      'light-comedy','soft-funny','easy-humor','casual-funny','slightly-witty',
      'pleasantly-funny','amusing-tone','smirk-worthy','low-key-funny','mild-comedy'
    ],
    basic: [
      'fun','odd','weird','goofy','wacky',
      'wild','cool','cute','nice','random',
      'silly','dumb','light','soft','chill',
      'okay-funny','kinda-funny','light-fun','basic-funny','mildly-funny',
      'simple-joke','soft-humor','small-funny','tiny-funny','casual'
    ],
  },
};

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 1, domain: 'D1', difficulty: 'Easy', sentence: 'The situation was _______ for everyone involved.', tone: 'dramatic', instruction: 'Make this sentence sound MORE dramatic', hint: 'Think: how catastrophically bad was it?', examples: ['catastrophic', 'devastating', 'harrowing'] },
  { id: 2, domain: 'D1', difficulty: 'Easy', sentence: 'She spoke in a _______ voice during the ceremony.', tone: 'formal', instruction: 'Make this sentence sound MORE formal', hint: 'Think: how would a diplomat speak?', examples: ['distinguished', 'eloquent', 'refined'] },
  { id: 3, domain: 'D1', difficulty: 'Easy', sentence: 'The news made him feel _______.', tone: 'sad', instruction: 'Make this sentence sound MORE deeply sad', hint: 'Think: the strongest feeling of loss', examples: ['devastated', 'heartbroken', 'inconsolable'] },
  { id: 4, domain: 'D1', difficulty: 'Easy', sentence: 'The performance was _______ from start to finish.', tone: 'positive', instruction: 'Make this sentence sound MORE positive', hint: 'Think: the most amazing show you\'ve seen', examples: ['extraordinary', 'spectacular', 'breathtaking'] },
  { id: 5, domain: 'D1', difficulty: 'Medium', sentence: 'The politician\'s behavior was _______ and unacceptable.', tone: 'negative', instruction: 'Make this sentence sound MORE negative', hint: 'Think: the strongest word of disapproval', examples: ['despicable', 'reprehensible', 'deplorable'] },
  { id: 6, domain: 'D1', difficulty: 'Medium', sentence: 'The matter requires _______ attention from all departments.', tone: 'urgent', instruction: 'Make this sentence sound MORE urgent', hint: 'Think: this cannot wait another moment', examples: ['immediate', 'imperative', 'critical'] },
  { id: 7, domain: 'D1', difficulty: 'Medium', sentence: 'Despite the setback, the future looked _______ for the team.', tone: 'hopeful', instruction: 'Make this sentence sound MORE hopeful', hint: 'Think: light at the end of the tunnel', examples: ['promising', 'auspicious', 'encouraging'] },
  { id: 8, domain: 'D1', difficulty: 'Medium', sentence: 'He responded to the injustice in a _______ tone.', tone: 'angry', instruction: 'Make this sentence sound MORE angry', hint: 'Think: righteous burning anger', examples: ['incensed', 'furious', 'outraged'] },
  { id: 9, domain: 'D1', difficulty: 'Hard', sentence: 'The garden in early morning was _______ and still.', tone: 'peaceful', instruction: 'Make this sentence sound MORE peaceful', hint: 'Think: perfect calm, no disturbance', examples: ['tranquil', 'serene', 'ethereal'] },
  { id: 10, domain: 'D1', difficulty: 'Hard', sentence: 'The clown\'s routine was _______ and the crowd loved it.', tone: 'humorous', instruction: 'Make this sentence sound MORE humorous', hint: 'Think: the funniest possible word', examples: ['hilarious', 'uproarious', 'sidesplitting'] },
  { id: 11, domain: 'D1', difficulty: 'Easy', sentence: 'The announcement was _______ and caught everyone by surprise.', tone: 'dramatic', instruction: 'Make this sentence sound MORE dramatic', hint: 'Think: shocking news delivery', examples: ['staggering', 'shocking', 'earth-shattering'] },
  { id: 12, domain: 'D1', difficulty: 'Easy', sentence: 'His response was _______ and well-received by the audience.', tone: 'formal', instruction: 'Make this sentence sound MORE formal', hint: 'Think: polished professional tone', examples: ['articulate', 'refined', 'eloquent'] },
  { id: 13, domain: 'D1', difficulty: 'Easy', sentence: 'She felt _______ after hearing the bad news.', tone: 'sad', instruction: 'Make this sentence sound MORE deeply sad', hint: 'Think: emotional collapse', examples: ['devastated', 'crushed', 'heartbroken'] },
  { id: 14, domain: 'D1', difficulty: 'Easy', sentence: 'The results were _______ and exceeded expectations.', tone: 'positive', instruction: 'Make this sentence sound MORE positive', hint: 'Think: beyond amazing', examples: ['spectacular', 'magnificent', 'extraordinary'] },
  { id: 15, domain: 'D1', difficulty: 'Medium', sentence: 'The decision was _______ and caused widespread criticism.', tone: 'negative', instruction: 'Make this sentence sound MORE negative', hint: 'Think: morally wrong decision', examples: ['reprehensible', 'deplorable', 'outrageous'] },
  { id: 16, domain: 'D1', difficulty: 'Medium', sentence: 'The team needs _______ action to avoid failure.', tone: 'urgent', instruction: 'Make this sentence sound MORE urgent', hint: 'Think: immediate intervention needed', examples: ['critical', 'immediate', 'essential'] },
  { id: 17, domain: 'D1', difficulty: 'Medium', sentence: 'Despite challenges, the outlook remains _______.', tone: 'hopeful', instruction: 'Make this sentence sound MORE hopeful', hint: 'Think: positive future possibility', examples: ['promising', 'encouraging', 'auspicious'] },
  { id: 18, domain: 'D1', difficulty: 'Medium', sentence: 'He reacted in a clearly _______ manner after the verdict.', tone: 'angry', instruction: 'Make this sentence sound MORE angry', hint: 'Think: intense emotional reaction', examples: ['furious', 'incensed', 'livid'] },
  { id: 19, domain: 'D1', difficulty: 'Hard', sentence: 'The lake at dawn was _______ and completely undisturbed.', tone: 'peaceful', instruction: 'Make this sentence sound MORE peaceful', hint: 'Think: perfect silence and calm', examples: ['serene', 'tranquil', 'placid'] },
  { id: 20, domain: 'D1', difficulty: 'Hard', sentence: 'The comedian\'s act was _______ and had the audience laughing nonstop.', tone: 'humorous', instruction: 'Make this sentence sound MORE humorous', hint: 'Think: extreme comedy', examples: ['hilarious', 'uproarious', 'ridiculous'] },
  { id: 21, domain: 'D1', difficulty: 'Easy', sentence: 'The situation quickly became _______ after the failure.', tone: 'dramatic', instruction: 'Make this sentence sound MORE dramatic', hint: 'Think: things spiraling badly', examples: ['catastrophic', 'chaotic', 'disastrous'] },
  { id: 22, domain: 'D1', difficulty: 'Easy', sentence: 'He gave a _______ explanation during the meeting.', tone: 'formal', instruction: 'Make this sentence sound MORE formal', hint: 'Think: structured professional speech', examples: ['precise', 'articulate', 'polished'] },
  { id: 23, domain: 'D1', difficulty: 'Easy', sentence: 'They felt _______ after the unexpected loss.', tone: 'sad', instruction: 'Make this sentence sound MORE deeply sad', hint: 'Think: emotional devastation', examples: ['bereft', 'sorrowful', 'devastated'] },
  { id: 24, domain: 'D1', difficulty: 'Easy', sentence: 'The event was _______ and truly unforgettable.', tone: 'positive', instruction: 'Make this sentence sound MORE positive', hint: 'Think: extremely impressive experience', examples: ['phenomenal', 'breathtaking', 'spectacular'] },
  { id: 25, domain: 'D1', difficulty: 'Medium', sentence: 'The company\'s actions were _______ and unethical.', tone: 'negative', instruction: 'Make this sentence sound MORE negative', hint: 'Think: serious moral wrongdoing', examples: ['corrupt', 'abhorrent', 'reprehensible'] },
  { id: 26, domain: 'D1', difficulty: 'Medium', sentence: 'The issue demands _______ response from leadership.', tone: 'urgent', instruction: 'Make this sentence sound MORE urgent', hint: 'Think: cannot delay action', examples: ['immediate', 'urgent', 'critical'] },
  { id: 27, domain: 'D1', difficulty: 'Medium', sentence: 'There is still a _______ chance of success.', tone: 'hopeful', instruction: 'Make this sentence sound MORE hopeful', hint: 'Think: positive but uncertain future', examples: ['promising', 'possible', 'encouraging'] },
  { id: 28, domain: 'D1', difficulty: 'Medium', sentence: 'She spoke in a _______ tone after the accusation.', tone: 'angry', instruction: 'Make this sentence sound MORE angry', hint: 'Think: controlled burning anger', examples: ['irate', 'furious', 'outraged'] },
  { id: 29, domain: 'D1', difficulty: 'Hard', sentence: 'The forest was _______ and untouched by civilization.', tone: 'peaceful', instruction: 'Make this sentence sound MORE peaceful', hint: 'Think: natural undisturbed calm', examples: ['tranquil', 'ethereal', 'serene'] },
  { id: 30, domain: 'D1', difficulty: 'Hard', sentence: 'The performance was _______ and had everyone in tears of laughter.', tone: 'humorous', instruction: 'Make this sentence sound MORE humorous', hint: 'Think: maximum comedy effect', examples: ['uproarious', 'hilarious', 'absurdist'] },
  { id: 31, domain: 'D2', difficulty: 'Easy', sentence: 'The discovery was _______ for modern science.', tone: 'positive', instruction: 'Make this sentence sound MORE positive', hint: 'Think: a discovery that changes everything', examples: ['groundbreaking', 'revolutionary', 'remarkable'] },
  { id: 32, domain: 'D2', difficulty: 'Easy', sentence: 'The weather turned _______ as the storm approached.', tone: 'dramatic', instruction: 'Make this sentence sound MORE dramatic', hint: 'Think: storm of the century', examples: ['catastrophic', 'severe', 'harrowing'] },
  { id: 33, domain: 'D2', difficulty: 'Easy', sentence: 'Her response was _______ and respectful.', tone: 'formal', instruction: 'Make this sentence sound MORE formal', hint: 'Think: polished professional tone', examples: ['dignified', 'polished', 'articulate'] },
  { id: 34, domain: 'D2', difficulty: 'Easy', sentence: 'He felt _______ after hearing the results.', tone: 'sad', instruction: 'Make this sentence sound MORE sad', hint: 'Think: emotional collapse', examples: ['devastated', 'heartbroken', 'miserable'] },
  { id: 35, domain: 'D2', difficulty: 'Easy', sentence: 'The comedian delivered a _______ performance.', tone: 'humorous', instruction: 'Make this sentence sound MORE humorous', hint: 'Think: extreme laughter', examples: ['hilarious', 'comical', 'uproarious'] },
  { id: 36, domain: 'D2', difficulty: 'Medium', sentence: 'The decision caused _______ reactions across the country.', tone: 'dramatic', instruction: 'Make this sentence sound MORE dramatic', hint: 'Think: nationwide shock', examples: ['earth-shattering', 'cataclysmic', 'staggering'] },
  { id: 37, domain: 'D2', difficulty: 'Medium', sentence: 'The report was written in a _______ tone.', tone: 'formal', instruction: 'Make this sentence sound MORE formal', hint: 'Think: academic precision', examples: ['authoritative', 'eloquent', 'refined'] },
  { id: 38, domain: 'D2', difficulty: 'Medium', sentence: 'She reacted with _______ after the announcement.', tone: 'angry', instruction: 'Make this sentence sound MORE angry', hint: 'Think: burning rage', examples: ['fury', 'incensed', 'enraged'] },
  { id: 39, domain: 'D2', difficulty: 'Medium', sentence: 'The situation remains _______ for all involved.', tone: 'negative', instruction: 'Make this sentence sound MORE negative', hint: 'Think: serious danger', examples: ['dire','deplorable','abhorrent'] },
  { id: 40, domain: 'D2', difficulty: 'Medium', sentence: 'The team showed a _______ improvement this season.', tone: 'positive', instruction: 'Make this sentence sound MORE positive', hint: 'Think: huge progress', examples: ['remarkable', 'phenomenal', 'spectacular'] },
  { id: 41, domain: 'D2', difficulty: 'Hard', sentence: 'The battlefield was _______ after the conflict.', tone: 'dramatic', instruction: 'Make this sentence sound MORE dramatic', hint: 'Think: total destruction', examples: ['apocalyptic', 'cataclysmic', 'devastating'] },
  { id: 42, domain: 'D2', difficulty: 'Hard', sentence: 'The ceremony was conducted in a _______ tone.', tone: 'formal', instruction: 'Make this sentence sound MORE formal', hint: 'Think: royal speech style', examples: ['ceremonious', 'stately', 'dignified'] },
  { id: 43, domain: 'D2', difficulty: 'Hard', sentence: 'The silence felt _______ and overwhelming.', tone: 'sad', instruction: 'Make this sentence sound MORE sad', hint: 'Think: deep emotional void', examples: ['despairing', 'inconsolable', 'bereft'] },
  { id: 44, domain: 'D2', difficulty: 'Hard', sentence: 'The victory was _______ for the entire nation.', tone: 'positive', instruction: 'Make this sentence sound MORE positive', hint: 'Think: historic triumph', examples: ['triumphant', 'magnificent', 'phenomenal'] },
  { id: 45, domain: 'D2', difficulty: 'Hard', sentence: 'The argument became _______ within seconds.', tone: 'angry', instruction: 'Make this sentence sound MORE angry', hint: 'Think: explosive rage', examples: ['volatile', 'seething', 'furious'] },
  { id: 46, domain: 'D2', difficulty: 'Hard', sentence: 'The future of the project looked _______.', tone: 'hopeful', instruction: 'Make this sentence sound MORE hopeful', hint: 'Think: bright future ahead', examples: ['promising', 'auspicious', 'transformative'] },
  { id: 47, domain: 'D2', difficulty: 'Hard', sentence: 'The criticism left her feeling _______.', tone: 'sad', instruction: 'Make this sentence sound MORE sad', hint: 'Think: emotional collapse', examples: ['devastated', 'heartbroken', 'mournful'] },
  { id: 48, domain: 'D2', difficulty: 'Hard', sentence: 'The response from officials was _______.', tone: 'negative', instruction: 'Make this sentence sound MORE negative', hint: 'Think: strong condemnation', examples: ['deplorable', 'egregious', 'reprehensible'] },
  { id: 49, domain: 'D2', difficulty: 'Hard', sentence: 'The environment was _______ and untouched.', tone: 'peaceful', instruction: 'Make this sentence sound MORE peaceful', hint: 'Think: pure natural calm', examples: ['serene', 'idyllic', 'tranquil'] },
  { id: 50, domain: 'D2', difficulty: 'Hard', sentence: 'The crowd erupted into _______ laughter.', tone: 'humorous', instruction: 'Make this sentence sound MORE humorous', hint: 'Think: uncontrollable laughter', examples: ['uproarious', 'hilarious', 'sidesplitting'] },
];

const TIMER_DURATION = 45;
const QUESTION_TIME = 18;

export default function ToneCraftScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;

  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [typedWord, setTypedWord] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [matchResult, setMatchResult] = useState<'perfect' | 'good' | 'basic' | 'none' | null>(null);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [lastFlashResult, setLastFlashResult] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [qTimeLeft, setQTimeLeft] = useState(QUESTION_TIME);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [shuffledQ] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));

  const timerRef = useRef<any>(null);
  const qTimerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const spotlightAnim = useRef(new Animated.Value(0.7)).current;
  const curtainLeftAnim = useRef(new Animated.Value(0)).current;
  const curtainRightAnim = useRef(new Animated.Value(0)).current;
  const mask1Anim = useRef(new Animated.Value(0)).current;
  const mask2Anim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(spotlightAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(spotlightAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(curtainLeftAnim, { toValue: 8, duration: 3000, useNativeDriver: true }),
      Animated.timing(curtainLeftAnim, { toValue: -8, duration: 3000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(curtainRightAnim, { toValue: -8, duration: 2500, useNativeDriver: true }),
      Animated.timing(curtainRightAnim, { toValue: 8, duration: 2500, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mask1Anim, { toValue: -10, duration: 1800, useNativeDriver: true }),
      Animated.timing(mask1Anim, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mask2Anim, { toValue: -12, duration: 2200, useNativeDriver: true }),
      Animated.timing(mask2Anim, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ])).start();
  }, []);

  // Global timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Per-question timer
  useEffect(() => {
    if (gameState !== 'playing' || submitted) return;
    setQTimeLeft(QUESTION_TIME);
    qTimerRef.current = setInterval(() => {
      setQTimeLeft(t => {
        if (t <= 1) {
          clearInterval(qTimerRef.current);
          handleDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(qTimerRef.current);
  }, [currentQ, gameState]);

  function endGame() {
    clearInterval(timerRef.current);
    clearInterval(qTimerRef.current);
    setGameState('results');
  }

  function checkWord(word: string): 'perfect' | 'good' | 'basic' | 'none' {
    const q = shuffledQ[currentQ];
    const bank = WORD_BANK[q.tone];
    const w = word.toLowerCase().trim();
    if (bank.perfect.some(p => p === w || w.includes(p) || p.includes(w))) return 'perfect';
    if (bank.good.some(g => g === w || w.includes(g) || g.includes(w))) return 'good';
    if (bank.basic.some(b => b === w || w.includes(b) || b.includes(w))) return 'basic';
    return 'none';
  }

  // Try Word — checks and adds to matched list, DOES NOT end question
  function handleTryWord() {
    const word = typedWord
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    if (!word || submitted) return;

    const result = checkWord(word);
    setLastFlashResult(result);

    // Flash animation
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();

    if (result !== 'none') {
      // Add to matched words if not already there
      setMatchedWords(prev => {
        if (!prev.includes(word)) return [...prev, word];
        return prev;
      });
      setTypedWord('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Wrong word — clear and let them try again
      setTypedWord('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // Done — scores based on best matched word, ends question
  function handleDone(timedOut: boolean = false) {
    if (submitted) return;
    clearInterval(qTimerRef.current);
    setSubmitted(true);

    const q = shuffledQ[currentQ];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 8;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((8 - timeTaken) * 2)) : 0;
    const bank = WORD_BANK[q.tone];

    // Normalize helper
    const normalize = (str: string) =>
      str.toLowerCase().trim().replace(/[^\w\s]/g, '');

    // Flexible matcher
    const matchesAny = (word: string, list: string[]) => {
      const cleanWord = normalize(word);

      return list.some(item => {
        const cleanItem = normalize(item);

        return (
          cleanWord === cleanItem ||
          cleanWord.includes(cleanItem) ||
          cleanItem.includes(cleanWord)
        );
      });
    };

    // Find best word from matched list
    let bestResult: 'perfect' | 'good' | 'basic' | 'none' = 'none';
    let bestWord = '';

    for (const rawWord of matchedWords) {
      const w = normalize(rawWord);

      if (matchesAny(w, bank.perfect)) {
        bestResult = 'perfect';
        bestWord = rawWord;
        break;
      }

      if (bestResult === 'none' && matchesAny(w, bank.good)) {
        bestResult = 'good';
        bestWord = rawWord;
      }

      if (bestResult === 'none' && matchesAny(w, bank.basic)) {
        bestResult = 'basic';
        bestWord = rawWord;
      }
    }

    // Also check current typed word if not timed out
    if (bestResult === 'none' && typedWord.trim() && !timedOut) {
      const cleanTyped = normalize(typedWord);

      if (matchesAny(cleanTyped, bank.perfect)) {
        bestResult = 'perfect';
        bestWord = typedWord.trim();
      } else if (matchesAny(cleanTyped, bank.good)) {
        bestResult = 'good';
        bestWord = typedWord.trim();
      } else if (matchesAny(cleanTyped, bank.basic)) {
        bestResult = 'basic';
        bestWord = typedWord.trim();
      }
    }

    let pts = 0;
    if (bestResult === 'perfect') {
      pts = 15 + speedBonus;
      if (isSpeedy) setSpeedyCount(s => s + 1);
      setScore(s => s + pts);
      showFloatingScore(`+${pts} 🎭 PERFECT!${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
    } else if (bestResult === 'good') {
      pts = 11 + speedBonus;
      if (isSpeedy) setSpeedyCount(s => s + 1);
      setScore(s => s + pts);
      showFloatingScore(`+${pts} 👏 GOOD!${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
    } else if (bestResult === 'basic') {
      pts = 8;
      setScore(s => s + pts);
      showFloatingScore(`+${pts} ✅ Basic`);
    } else {
      // No match — lose a life
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
    }

    setMatchResult(bestResult);
    setAnswers(prev => [...prev, {
      question: q.sentence, tone: q.tone, instruction: q.instruction,
      userWord: bestWord || matchedWords[0] || '(nothing)', result: bestResult,
      pts, examples: q.examples,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => advanceQuestion(), 2200);
  }

  function advanceQuestion() {
    if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
    setCurrentQ(q => q + 1);
    setTypedWord('');
    setSubmitted(false);
    setMatchResult(null);
    setMatchedWords([]);
    setLastFlashResult(null);
    setQuestionStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 300);
  }

  function shakeScreen() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function showFloatingScore(text: string) {
    setFloatingScore(text);
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: -40, duration: 600, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: -80, duration: 400, useNativeDriver: true }),
    ]).start(() => { setFloatingScore(null); scoreAnim.setValue(0); });
  }

  function togglePause() {
    if (gameState === 'playing') {
      clearInterval(timerRef.current);
      clearInterval(qTimerRef.current);
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }

  function restartGame() {
    clearInterval(timerRef.current);
    clearInterval(qTimerRef.current);
    setCurrentQ(0); setTypedWord(''); setSubmitted(false);
    setMatchResult(null); setMatchedWords([]); setLives(3);
    setScore(0); setTimeLeft(TIMER_DURATION); setQTimeLeft(QUESTION_TIME);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setLastFlashResult(null);
    setGameState('playing');
  }

  const finalScore = questionsAnswered > 0
    ? Math.min(Math.round((score / (questionsAnswered * 17)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';
  const qTimerPct = qTimeLeft / QUESTION_TIME;
  const qTimerColor = qTimerPct > 0.5 ? '#F59E0B' : qTimerPct > 0.25 ? '#F97316' : '#EF4444';

  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(8, finalScore, xpEarned, 'rw_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.result !== 'none').length;
    const message = finalScore >= 75 ? '🎭 Bravo!' : finalScore >= 40 ? '👏 Good Show!' : '💪 Keep Rehearsing!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 🎭</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, {
              borderLeftColor: a.result === 'perfect' ? '#F59E0B' : a.result === 'good' ? '#10B981' : a.result === 'basic' ? '#38BDF8' : '#EF4444'
            }]}>
              <Text style={styles.reviewTone}>🎭 {a.instruction}</Text>
              <Text style={styles.reviewQ}>{a.question.replace('_______', `[${a.userWord}]`)}</Text>
              <Text style={[styles.reviewResult, {
                color: a.result === 'perfect' ? '#F59E0B' : a.result === 'good' ? '#10B981' : a.result === 'basic' ? '#38BDF8' : '#EF4444'
              }]}>
                {a.result === 'perfect' ? '🌟 Perfect tone!' : a.result === 'good' ? '✅ Good tone!' : a.result === 'basic' ? '👍 Basic match' : '❌ No match'}
                {a.pts > 0 ? `  +${a.pts} pts` : ''}
              </Text>
              <Text style={styles.reviewExamples}>💡 Strong examples: {a.examples.join(', ')}</Text>
            </View>
          ))}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{correctCount}/{questionsAnswered}</Text>
                <Text style={styles.perfLabel}>Matched</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{speedyCount}</Text>
                <Text style={styles.perfLabel}>⚡ Speedy</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{lives < 0 ? 0 : lives}</Text>
                <Text style={styles.perfLabel}>❤️ Lives Left</Text>
              </View>
            </View>
          </View>
          <View style={styles.xpCard}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <Text style={styles.xpScore}>{finalScore}</Text>
            <Text style={styles.xpSub}>Score out of 100</Text>
            <Text style={styles.xpGained}>+{xpEarned} XP added to Tone Craft</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📈 Your History</Text>
            <Text style={styles.historySub}>Play more games to see your history!</Text>
            <Text style={styles.historyRank}>Game #1 — Score: {finalScore}</Text>
          </View>
          {isDailyChallenge ? (
            <TouchableOpacity style={styles.continueBtn} onPress={async () => {
              const today = new Date().toISOString().split('T')[0];
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.setItem(`daily_played_${today}_${dailyGames[currentIndex]}`, '1');
              const { DeviceEventEmitter } = await import('react-native');
              DeviceEventEmitter.emit('daily_played_changed');
              if (typeof window !== 'undefined' && typeof Event === 'function') window.dispatchEvent(new Event('daily_played_changed'));
              router.replace('/(tabs)' as any);
            }}>
              <Text style={styles.continueBtnText}>Done ✓</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.continueBtn} onPress={restartGame}>
                <Text style={styles.continueBtnText}>Play Again 🎭</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quitBtn} onPress={() => router.back()}>
                <Text style={styles.quitBtnText}>← Back to Games</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = shuffledQ[currentQ];
  const toneColor: Record<string, string> = {
    dramatic: '#DC2626', formal: '#6366F1', sad: '#60A5FA',
    positive: '#10B981', negative: '#EF4444', urgent: '#F97316',
    hopeful: '#34D399', angry: '#EF4444', peaceful: '#38BDF8', humorous: '#F59E0B',
  };
  const tc = toneColor[q.tone] || '#F59E0B';

  const flashColor = lastFlashResult === 'none' ? '#EF4444' :
    lastFlashResult === 'perfect' ? '#F59E0B' :
    lastFlashResult === 'good' ? '#10B981' : '#38BDF8';

  const resultLabel = matchResult === 'perfect' ? '🌟 PERFECT TONE! Keep going or tap Done!' :
    matchResult === 'good' ? '✅ GOOD MATCH! Try for better or tap Done!' :
    matchResult === 'basic' ? '👍 BASIC MATCH. Try a stronger word!' :
    matchResult === 'none' ? '❌ NO MATCH — Try a different word' : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

          {/* THEATER BACKGROUND */}
          <View style={styles.theaterBg} pointerEvents="none">
            <Animated.View style={[styles.spotlight, { opacity: spotlightAnim }]} />
            <Animated.Text style={[styles.curtainLeft, { transform: [{ rotate: curtainLeftAnim.interpolate({ inputRange: [-10, 10], outputRange: ['-3deg', '3deg'] }) }] }]}>🎪</Animated.Text>
            <Animated.Text style={[styles.curtainRight, { transform: [{ rotate: curtainRightAnim.interpolate({ inputRange: [-10, 10], outputRange: ['3deg', '-3deg'] }) }] }]}>🎪</Animated.Text>
            <Animated.Text style={[styles.maskHappy, { transform: [{ translateY: mask1Anim }] }]}>😄</Animated.Text>
            <Animated.Text style={[styles.maskSad, { transform: [{ translateY: mask2Anim }] }]}>😢</Animated.Text>
            <Text style={styles.stageLeft}>🎭</Text>
            <Text style={styles.stageRight}>🎭</Text>
            <Text style={styles.stageMic}>🎤</Text>
            <Text style={styles.stageScroll}>📜</Text>
            <View style={styles.stageFloor} />
            <Text style={styles.stageBoard1}>🎶</Text>
            <Text style={styles.stageBoard2}>⭐</Text>
            <Text style={styles.stageBoard3}>🎶</Text>
          </View>

          {/* HEADER */}
          <View style={styles.gameHeader}>
            <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
              <Text style={styles.pauseIcon}>⏸</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.gameTitle}>🎭 Tone Craft</Text>
              <Text style={styles.gameSubtitle}>D1 · Craft & Structure</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNum}>{score}</Text>
              <Text style={styles.scoreLabel}>pts</Text>
            </View>
          </View>

          {floatingScore && (
            <Animated.Text style={[styles.floatingScore, { transform: [{ translateY: scoreAnim }] }]}>
              {floatingScore}
            </Animated.Text>
          )}

          {/* STATUS ROW */}
          <View style={styles.statusRow}>
            <View style={styles.livesRow}>
              {[1,2,3].map(i => <Text key={i} style={styles.heart}>{i <= lives ? '❤️' : '🖤'}</Text>)}
            </View>
            <View style={styles.timerBox}>
              <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
              <View style={styles.timerBarBg}>
                <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
              </View>
            </View>
            <View style={styles.qCounterBox}>
              <Text style={styles.qCounter}>{currentQ + 1}/{shuffledQ.length}</Text>
            </View>
          </View>

          <ScrollView style={styles.gameScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* TONE INSTRUCTION */}
            <View style={[styles.toneBox, { borderColor: tc }]}>
              <Text style={styles.toneLabel}>TONE GOAL</Text>
              <Text style={[styles.toneInstruction, { color: tc }]}>{q.instruction}</Text>
              <Text style={styles.toneHint}>💡 {q.hint}</Text>
            </View>

            {/* Q TIMER */}
            <View style={styles.qTimerRow}>
              <Text style={[styles.qTimerNum, { color: qTimerColor }]}>⏱ {qTimeLeft}s to type words</Text>
              <View style={styles.qTimerBarBg}>
                <View style={[styles.qTimerBarFill, { width: `${qTimerPct * 100}%` as any, backgroundColor: qTimerColor }]} />
              </View>
            </View>

            {/* SENTENCE */}
            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceLabel}>FILL IN THE BLANK</Text>
              <Text style={styles.sentenceText}>
                {q.sentence.split('_______').map((part, i, arr) => (
                  <Text key={i}>
                    <Text style={styles.sentencePart}>{part}</Text>
                    {i < arr.length - 1 && (
                      <Text style={[styles.blankHighlight, { color: tc }]}>
                        {matchedWords.length > 0 ? ` ${matchedWords[matchedWords.length - 1]} ` : ' _______ '}
                      </Text>
                    )}
                  </Text>
                ))}
              </Text>
            </View>

            {/* MATCHED WORDS */}
            {matchedWords.length > 0 && (
              <View style={styles.matchedContainer}>
                <Text style={styles.matchedLabel}>✅ Matched words (scored on best):</Text>
                <View style={styles.matchedPills}>
                  {matchedWords.map((w, i) => {
                    const bank = WORD_BANK[q.tone];
                    const col = bank.perfect.some(p => p === w || w.includes(p) || p.includes(w)) ? '#F59E0B'
                      : bank.good.some(g => g === w || w.includes(g) || g.includes(w)) ? '#10B981' : '#38BDF8';
                    return (
                      <View key={i} style={[styles.matchedPill, { borderColor: col }]}>
                        <Text style={[styles.matchedPillText, { color: col }]}>{w}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* FLASH FEEDBACK */}
            {lastFlashResult && (
              <Animated.View style={[styles.flashFeedback, {
                backgroundColor: flashColor + '25',
                borderColor: flashColor,
                opacity: Animated.add(0.3, Animated.multiply(flashAnim, 0.7)) as any,
              }]}>
                <Text style={[styles.flashFeedbackText, { color: flashColor }]}>
                  {lastFlashResult === 'none' ? '❌ Not a match — try another word!' :
                   lastFlashResult === 'perfect' ? '🌟 Perfect word! Keep going or tap Done!' :
                   lastFlashResult === 'good' ? '✅ Good word! Try for perfect or tap Done!' :
                   '👍 Basic match — try a stronger word!'}
                </Text>
              </Animated.View>
            )}

            {/* INPUT AREA */}
            {!submitted && (
              <View style={styles.inputArea}>
                <View style={[styles.inputWrapper, { borderColor: tc }]}>
                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={typedWord}
                    onChangeText={setTypedWord}
                    placeholder="Type a word that matches the tone..."
                    placeholderTextColor="#6B21A840"
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleTryWord}
                    editable={!submitted}
                  />
                </View>
                <View style={styles.inputBtnRow}>
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: typedWord.trim() ? '#F59E0B' : '#F59E0B40' }]}
                    onPress={handleTryWord}
                  >
                    <Text style={[styles.submitBtnText, { color: typedWord.trim() ? '#1A0A0E' : '#1A0A0E80' }]}>Try Word ✨</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.doneBtn, { backgroundColor: matchedWords.length > 0 ? '#DC2626' : '#2A1015', borderWidth: 2, borderColor: matchedWords.length > 0 ? '#DC2626' : '#6B21A8' }]}
                    onPress={() => handleDone(false)}
                  >
                    <Text style={[styles.doneBtnText, { color: matchedWords.length > 0 ? '#FFFFFF' : '#6B21A8' }]}>Done 🎬</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputHint}>
                  💡 Type words · Tap Try to check · Tap Done to score your best word
                </Text>
              </View>
            )}

            {/* SUBMITTED RESULT */}
            {submitted && matchResult && (
              <View style={[styles.resultBanner, {
                backgroundColor: matchResult === 'perfect' ? '#F59E0B20' :
                  matchResult === 'good' ? '#10B98120' :
                  matchResult === 'basic' ? '#38BDF820' : '#EF444420',
                borderColor: matchResult === 'perfect' ? '#F59E0B' :
                  matchResult === 'good' ? '#10B981' :
                  matchResult === 'basic' ? '#38BDF8' : '#EF4444',
              }]}>
                <Text style={[styles.resultBannerText, {
                  color: matchResult === 'perfect' ? '#F59E0B' :
                    matchResult === 'good' ? '#10B981' :
                    matchResult === 'basic' ? '#38BDF8' : '#EF4444',
                }]}>
                  {matchResult === 'perfect' ? '🌟 PERFECT TONE!' :
                   matchResult === 'good' ? '✅ GOOD MATCH!' :
                   matchResult === 'basic' ? '👍 BASIC MATCH' : '❌ NO MATCH'}
                </Text>
                {matchResult === 'none' && (
                  <Text style={styles.resultExamples}>Try: {q.examples.slice(0, 2).join(', ')}</Text>
                )}
              </View>
            )}

          </ScrollView>
        </Animated.View>

        {/* PAUSE OVERLAY */}
        {gameState === 'paused' && (
          <View style={styles.pauseOverlay}>
            <View style={styles.pauseCard}>
              <Text style={styles.pauseTitle}>⏸ Intermission</Text>
              <Text style={styles.pauseSub}>Score: {score} pts</Text>
              <TouchableOpacity style={styles.pauseOption} onPress={togglePause}>
                <Text style={styles.pauseOptionText}>▶️ Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pauseOption} onPress={restartGame}>
                <Text style={styles.pauseOptionText}>🔄 Restart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pauseOption, styles.pauseQuit]} onPress={async () => {
                if (isDailyChallenge) {
                  const today = new Date().toISOString().split('T')[0];
                  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
                  await AsyncStorage.setItem(`daily_played_${today}_${dailyGames[currentIndex]}`, '1');
                const { DeviceEventEmitter } = await import('react-native');
                DeviceEventEmitter.emit('daily_played_changed');
                if (typeof window !== 'undefined' && typeof Event === 'function') window.dispatchEvent(new Event('daily_played_changed'));
                  router.replace('/(tabs)' as any);
                } else {
                  router.back();
                }
              }}>
                <Text style={styles.pauseQuitText}>🚪 Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1A0A0E' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#1A0A0E' },
  theaterBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 },
  spotlight: { position: 'absolute', top: -100, left: '20%', width: '60%', height: 400, backgroundColor: '#F59E0B08', borderRadius: 200 },
  curtainLeft: { position: 'absolute', top: 60, left: -10, fontSize: 80, opacity: 0.35, transformOrigin: 'top' },
  curtainRight: { position: 'absolute', top: 60, right: -10, fontSize: 80, opacity: 0.35, transformOrigin: 'top' },
  maskHappy: { position: 'absolute', top: 140, left: '12%', fontSize: 48, opacity: 0.7 },
  maskSad: { position: 'absolute', top: 130, right: '10%', fontSize: 48, opacity: 0.7 },
  stageLeft: { position: 'absolute', top: 200, left: '5%', fontSize: 30, opacity: 0.5 },
  stageRight: { position: 'absolute', top: 200, right: '5%', fontSize: 30, opacity: 0.5 },
  stageMic: { position: 'absolute', bottom: 120, left: '10%', fontSize: 28, opacity: 0.5 },
  stageScroll: { position: 'absolute', bottom: 120, right: '10%', fontSize: 28, opacity: 0.5 },
  stageFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#2A1015', borderTopWidth: 3, borderTopColor: '#F59E0B40' },
  stageBoard1: { position: 'absolute', bottom: 20, left: '15%', fontSize: 24, opacity: 0.6 },
  stageBoard2: { position: 'absolute', bottom: 25, left: '48%', fontSize: 22, opacity: 0.7 },
  stageBoard3: { position: 'absolute', bottom: 20, right: '15%', fontSize: 24, opacity: 0.6 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20, gap: 12, zIndex: 10 },
  pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2A1015', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
  scoreBox: { backgroundColor: '#F9731620', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#F97316' },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F97316' },
  scoreLabel: { fontSize: 10, color: '#F97316', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 24, top: 110, fontSize: 22, fontWeight: '900', color: '#F59E0B', zIndex: 100 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10, backgroundColor: '#2A1015CC', borderRadius: 16, padding: 12, zIndex: 10 },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#3D1520', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: { backgroundColor: '#F59E0B20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B' },
  qCounter: { fontSize: 14, color: '#F59E0B', fontWeight: '800' },
  gameScroll: { flex: 1, paddingHorizontal: 20, zIndex: 10 },
  toneBox: { backgroundColor: '#2A1015', borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 2 },
  toneLabel: { fontSize: 10, color: '#F59E0B', fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  toneInstruction: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  toneHint: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  qTimerRow: { marginBottom: 10 },
  qTimerNum: { fontSize: 13, fontWeight: '700', marginBottom: 4, textAlign: 'right' },
  qTimerBarBg: { height: 6, backgroundColor: '#3D1520', borderRadius: 3, overflow: 'hidden' },
  qTimerBarFill: { height: 6, borderRadius: 3 },
  sentenceBox: { backgroundColor: '#2A1015', borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#6B21A860' },
  sentenceLabel: { fontSize: 10, color: '#DC2626', fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  sentenceText: { fontSize: 20, color: '#FFFFFF', lineHeight: 32 },
  sentencePart: { color: '#E2E8F0' },
  blankHighlight: { fontWeight: '900', fontSize: 22 },
  matchedContainer: { marginBottom: 10 },
  matchedLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 6, fontWeight: '600' },
  matchedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  matchedPill: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#2A1015' },
  matchedPillText: { fontSize: 14, fontWeight: '700' },
  flashFeedback: { borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1.5, alignItems: 'center' },
  flashFeedbackText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  inputArea: { marginBottom: 20 },
  inputWrapper: { backgroundColor: '#2A1015', borderRadius: 16, borderWidth: 2, marginBottom: 10, overflow: 'hidden' },
  textInput: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', padding: 16, minHeight: 56 },
  inputBtnRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  submitBtn: { flex: 1, padding: 16, borderRadius: 50, alignItems: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '800' },
  doneBtn: { flex: 1, padding: 16, borderRadius: 50, alignItems: 'center' },
  doneBtnText: { fontSize: 16, fontWeight: '800' },
  inputHint: { fontSize: 12, color: '#6B21A8', textAlign: 'center', fontStyle: 'italic' },
  resultBanner: { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 2, alignItems: 'center' },
  resultBannerText: { fontSize: 20, fontWeight: '900' },
  resultExamples: { fontSize: 13, color: '#9CA3AF', marginTop: 6 },
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#2A1015', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewTone: { fontSize: 12, color: '#F59E0B', fontWeight: '700', marginBottom: 4 },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 6 },
  reviewResult: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  reviewExamples: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  performanceCard: { backgroundColor: '#2A1015', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B40' },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#1A0A0E', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#F59E0B' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#F9731615', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F97316' },
  xpTitle: { fontSize: 16, color: '#F97316', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#F97316', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#2A1015', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B40' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#F59E0B', fontWeight: '700' },
  continueBtn: { backgroundColor: '#DC2626', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 20 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#3D1520' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pauseCard: { backgroundColor: '#2A1015', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#DC2626', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});