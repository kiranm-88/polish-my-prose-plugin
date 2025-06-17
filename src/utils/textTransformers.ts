
export const makeFormalText = (text: string): string => {
  let formal = text;
  
  // Expand ALL contractions thoroughly
  formal = formal.replace(/can't/gi, 'cannot');
  formal = formal.replace(/won't/gi, 'will not');
  formal = formal.replace(/shouldn't/gi, 'should not');
  formal = formal.replace(/wouldn't/gi, 'would not');
  formal = formal.replace(/couldn't/gi, 'could not');
  formal = formal.replace(/didn't/gi, 'did not');
  formal = formal.replace(/doesn't/gi, 'does not');
  formal = formal.replace(/don't/gi, 'do not');
  formal = formal.replace(/haven't/gi, 'have not');
  formal = formal.replace(/hasn't/gi, 'has not');
  formal = formal.replace(/isn't/gi, 'is not');
  formal = formal.replace(/aren't/gi, 'are not');
  formal = formal.replace(/wasn't/gi, 'was not');
  formal = formal.replace(/weren't/gi, 'were not');
  formal = formal.replace(/I'm/gi, 'I am');
  formal = formal.replace(/you're/gi, 'you are');
  formal = formal.replace(/we're/gi, 'we are');
  formal = formal.replace(/they're/gi, 'they are');
  formal = formal.replace(/he's/gi, 'he is');
  formal = formal.replace(/she's/gi, 'she is');
  formal = formal.replace(/it's/gi, 'it is');
  formal = formal.replace(/I've/gi, 'I have');
  formal = formal.replace(/you've/gi, 'you have');
  formal = formal.replace(/we've/gi, 'we have');
  formal = formal.replace(/they've/gi, 'they have');
  formal = formal.replace(/I'll/gi, 'I will');
  formal = formal.replace(/you'll/gi, 'you will');
  formal = formal.replace(/we'll/gi, 'we will');
  formal = formal.replace(/they'll/gi, 'they will');
  formal = formal.replace(/I'd/gi, 'I would');
  formal = formal.replace(/you'd/gi, 'you would');
  formal = formal.replace(/he'd/gi, 'he would');
  formal = formal.replace(/she'd/gi, 'she would');
  
  // Replace informal expressions with sophisticated alternatives
  const formalReplacements = {
    'gonna': 'going to',
    'wanna': 'want to',
    'gotta': 'have to',
    'yeah': 'yes',
    'yep': 'yes',
    'nope': 'no',
    'ok': 'acceptable',
    'okay': 'acceptable',
    'alright': 'acceptable',
    'stuff': 'materials',
    'things': 'elements',
    'get': 'obtain',
    'got': 'obtained',
    'really': 'particularly',
    'very': 'extremely',
    'pretty': 'quite',
    'super': 'exceptionally',
    'awesome': 'outstanding',
    'amazing': 'remarkable',
    'cool': 'impressive',
    'great': 'excellent',
    'good': 'satisfactory',
    'bad': 'unsatisfactory',
    'big': 'substantial',
    'small': 'minimal',
    'huge': 'enormous',
    'tiny': 'minuscule',
    'lots of': 'numerous',
    'a lot of': 'many',
    'tons of': 'substantial quantities of',
    'bunch of': 'several',
    'help out': 'assist',
    'find out': 'determine',
    'figure out': 'ascertain',
    'check out': 'examine',
    'show up': 'appear',
    'come up': 'arise',
    'bring up': 'raise',
    'pick up': 'acquire',
    'set up': 'establish',
    'hang out': 'socialize',
    'work out': 'exercise',
    'turn out': 'result'
  };
  
  // Apply formal replacements with word boundaries
  Object.entries(formalReplacements).forEach(([informal, formalWord]) => {
    const regex = new RegExp(`\\b${informal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    formal = formal.replace(regex, formalWord);
  });
  
  // Add formal sentence connectors and structure
  formal = formal.replace(/\bso\b/gi, 'therefore');
  formal = formal.replace(/\bbut\b/gi, 'however');
  formal = formal.replace(/\balso\b/gi, 'furthermore');
  formal = formal.replace(/\bplus\b/gi, 'additionally');
  formal = formal.replace(/\banyway\b/gi, 'nevertheless');
  formal = formal.replace(/\band then\b/gi, 'subsequently');
  formal = formal.replace(/\bafter that\b/gi, 'thereafter');
  formal = formal.replace(/\bbecause of\b/gi, 'due to');
  formal = formal.replace(/\bsince\b/gi, 'given that');
  
  // Add formal prefixes to make it sound more professional
  if (formal.length > 50 && !formal.match(/^(I would|It is|This|In my|With regard|Furthermore|Moreover|Additionally)/i)) {
    formal = 'I would like to mention that ' + formal.charAt(0).toLowerCase() + formal.slice(1);
  }
  
  // Ensure proper capitalization and punctuation
  formal = formal.replace(/(^|\. )([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
  formal = formal.trim();
  if (!/[.!?]$/.test(formal)) {
    formal += '.';
  }
  
  return formal;
};

export const makeCasualText = (text: string): string => {
  let casual = text;
  
  // Add MORE contractions for conversational tone
  casual = casual.replace(/\bi will\b/gi, "I'll");
  casual = casual.replace(/\byou will\b/gi, "you'll");
  casual = casual.replace(/\bwe will\b/gi, "we'll");
  casual = casual.replace(/\bthey will\b/gi, "they'll");
  casual = casual.replace(/\bi have\b/gi, "I've");
  casual = casual.replace(/\byou have\b/gi, "you've");
  casual = casual.replace(/\bwe have\b/gi, "we've");
  casual = casual.replace(/\bthey have\b/gi, "they've");
  casual = casual.replace(/\bi would\b/gi, "I'd");
  casual = casual.replace(/\byou would\b/gi, "you'd");
  casual = casual.replace(/\bhe would\b/gi, "he'd");
  casual = casual.replace(/\bshe would\b/gi, "she'd");
  casual = casual.replace(/\bi am\b/gi, "I'm");
  casual = casual.replace(/\byou are\b/gi, "you're");
  casual = casual.replace(/\bwe are\b/gi, "we're");
  casual = casual.replace(/\bthey are\b/gi, "they're");
  casual = casual.replace(/\bgoing to\b/gi, "gonna");
  casual = casual.replace(/\bwant to\b/gi, "wanna");
  casual = casual.replace(/\bhave to\b/gi, "gotta");
  
  // Replace formal words with very casual alternatives
  const casualReplacements = {
    'obtain': 'get',
    'obtained': 'got',
    'receive': 'get',
    'received': 'got',
    'substantial': 'huge',
    'minimal': 'tiny',
    'excellent': 'awesome',
    'outstanding': 'amazing',
    'remarkable': 'cool',
    'impressive': 'sweet',
    'satisfactory': 'decent',
    'unsatisfactory': 'crappy',
    'enormous': 'massive',
    'minuscule': 'super tiny',
    'particularly': 'really',
    'extremely': 'super',
    'exceptionally': 'crazy',
    'numerous': 'tons of',
    'several': 'a bunch of',
    'materials': 'stuff',
    'elements': 'things',
    'assist': 'help out',
    'determine': 'figure out',
    'ascertain': 'find out',
    'examine': 'check out',
    'appear': 'show up',
    'arise': 'come up',
    'raise': 'bring up',
    'acquire': 'pick up',
    'establish': 'set up',
    'socialize': 'hang out',
    'exercise': 'work out',
    'acceptable': 'cool'
  };
  
  // Apply casual replacements
  Object.entries(casualReplacements).forEach(([formal, casualWord]) => {
    const regex = new RegExp(`\\b${formal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    casual = casual.replace(regex, casualWord);
  });
  
  // Make connectors more casual
  casual = casual.replace(/\bhowever\b/gi, 'but');
  casual = casual.replace(/\btherefore\b/gi, 'so');
  casual = casual.replace(/\bfurthermore\b/gi, 'also');
  casual = casual.replace(/\badditionally\b/gi, 'plus');
  casual = casual.replace(/\bnevertheless\b/gi, 'anyway');
  casual = casual.replace(/\bsubsequently\b/gi, 'then');
  casual = casual.replace(/\bthereafter\b/gi, 'after that');
  casual = casual.replace(/\bdue to\b/gi, 'because of');
  casual = casual.replace(/\bgiven that\b/gi, 'since');
  
  // Remove formal prefixes and make it sound conversational
  casual = casual.replace(/^I would like to mention that /i, 'So ');
  casual = casual.replace(/^It is important to note that /i, 'Just so you know, ');
  casual = casual.replace(/^With regard to /i, 'About ');
  casual = casual.replace(/^Furthermore, /i, 'Also, ');
  casual = casual.replace(/^Moreover, /i, 'Plus, ');
  casual = casual.replace(/^Additionally, /i, 'And ');
  
  // Add casual conversation starters for longer text
  if (casual.length > 40 && !casual.match(/^(So|Hey|Well|Basically|Actually|You know)/i)) {
    const starters = ['So basically, ', 'You know, ', 'Actually, ', 'Well, '];
    const randomStarter = starters[Math.floor(Math.random() * starters.length)];
    casual = randomStarter + casual.charAt(0).toLowerCase() + casual.slice(1);
  }
  
  // Make punctuation more casual (remove some periods, add some...)
  casual = casual.replace(/\.$/, '...');
  
  return casual;
};
