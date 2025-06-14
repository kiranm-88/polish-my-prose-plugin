
export const applyBasicCorrections = (text: string) => {
  const suggestions = [];
  let correctedText = text;

  // Fix "Lets" to "Let's" (missing apostrophe)
  if (text.includes('Lets ')) {
    correctedText = correctedText.replace(/\bLets\b/g, "Let's");
    suggestions.push({
      type: 'Grammar',
      text: correctedText,
      explanation: "Add apostrophe to 'Let's'",
      originalWord: 'Lets',
      suggestion: "Let's",
      context: 'Contractions need apostrophes'
    });
  }

  // Fix "sdeal" to "deal" (typo)
  if (text.includes('sdeal')) {
    correctedText = correctedText.replace(/sdeal/g, 'deal');
    suggestions.push({
      type: 'Spelling',
      text: correctedText,
      explanation: 'Fix spelling error',
      originalWord: 'sdeal',
      suggestion: 'deal',
      context: 'Spelling correction'
    });
  }

  // Fix "ok" to more formal alternatives
  if (text.toLowerCase().startsWith('ok ')) {
    const formalText = correctedText.replace(/^ok\b/i, 'Okay');
    suggestions.push({
      type: 'Style',
      text: formalText,
      explanation: 'Use more formal language',
      originalWord: 'ok',
      suggestion: 'Okay',
      context: 'Style improvement'
    });
  }

  // Capitalization after periods
  const capitalizeRegex = /\.\s+([a-z])/g;
  if (capitalizeRegex.test(correctedText)) {
    correctedText = correctedText.replace(capitalizeRegex, (match, letter) => `. ${letter.toUpperCase()}`);
    suggestions.push({
      type: 'Grammar',
      text: correctedText,
      explanation: 'Capitalize sentences after periods',
      context: 'Sentences should start with capital letters'
    });
  }

  // Multiple spaces
  if (correctedText.includes('  ')) {
    correctedText = correctedText.replace(/\s+/g, ' ');
    suggestions.push({
      type: 'Formatting',
      text: correctedText,
      explanation: 'Remove extra spaces',
      context: 'Multiple consecutive spaces found'
    });
  }

  // Basic punctuation
  if (correctedText.includes(' ,')) {
    correctedText = correctedText.replace(/ ,/g, ',');
    suggestions.push({
      type: 'Punctuation',
      text: correctedText,
      explanation: 'Fix comma spacing',
      context: 'Commas should not have spaces before them'
    });
  }

  return suggestions;
};
