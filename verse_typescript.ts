/**
 * TypeScript port of Verse-Python by Austin Pursley
 * This a nuanced rhyme finder based on the CMU Pronouncing dictionary
 * and PronouncingPy / Pronouncing.js libraries by Allison Parrish
 * @Source (Verse-Python): https://github.com/austinpursley/verse-python
 * @Source (Python Script): https://austinpursley.com/projects/verse_rhymes_and_more.html
 * @Source (CMU): http://www.speech.cs.cmu.edu/cgi-bin/cmudict
 * @Source (Pronouncing Py): https://github.com/aparrish/pronouncingpy, 
 * @Source (Pronouncing.js): https://github.com/aparrish/pronouncingjs
 * My .JS adaptation of Parrish's Pronouncing Py guide: https://github.com/AlekseyCalvin/pronouncingjs/blob/master/PronouncingJS_Intro_Guide.md
 * @Also see: https://en.wikipedia.org/wiki/Arpabet
 * 
 * 
 * 
 * Dependencies:
 *   npm install pronouncingjs
 * 
 * To use directly in your terminal, launch 'node'
 * CMU dictionary data loads automatically upon a call to a pronouncing function
 * Then:
 *   var pronouncing = require('pronouncing');
 * 
 */

import pronouncing from 'pronouncingjs';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** Valid search directions for assonance / consonance queries. */
export type SearchDirection = 'forward' | 'backward' | null;

/** Options for the near-rhyme search. */
export interface NearRhymeOptions {
  /** If true, vowels must match stress markers (default: true). */
  stress?: boolean;
  /** Number of trailing consonant phonemes allowed after the match (default: 0). */
  consonantTail?: number;
}

/** Options for regex search scope. */
export type SearchOption = 'end' | 'begin' | 'whole';

/** Supported rhyme types used by `rhymeTypeRandom`. */
export type RhymeType =
  | 'perfect'
  | 'identical'
  | 'random_match_phones'
  | 'random_general'
  | 'assonance'
  | 'consonance'
  | 'slant_assonance'
  | 'slant_consonance';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Returns a list of possible English consonant clusters.
 *
 * A consonant cluster is "a group of consonants which have no intervening
 * vowel".  The list below is hand-curated based on English phonotactics.
 *
 * @see https://en.wikipedia.org/wiki/Consonant_cluster
 * @see http://www-personal.umich.edu/~duanmu/CR02.pdf
 * @see http://fonetiks.info/bgyang/db/201606cmu.pdf
 * @see https://www.enchantedlearning.com/consonantblends/
 */
export function consonantClusters(): readonly string[] {
  return [
    'F W', 'F R', 'F L', 'S W', 'S V',
    'S R', 'S L', 'S N', 'S M', 'S F',
    'S P', 'S T', 'S K', 'SH W', 'SH R',
    'SH L', 'SH N', 'SH M', 'TH W', 'TH R',
    'V W', 'V R', 'V L', 'Z W', 'Z L',
    'B W', 'B R', 'B L', 'D W', 'D R',
    'G W', 'G R', 'G L', 'P W', 'P R',
    'P L', 'T W', 'T R', 'K W', 'K R',
    'K L', 'L Y', 'N Y', 'M Y', 'V Y',
    'H Y', 'F Y', 'S Y', 'TH Y', 'Z Y',
    'B Y', 'D Y', 'G Y', 'P Y', 'T Y',
    'K Y', 'S P L', 'S P R', 'S T R', 'S K R',
    'S K W',
  ] as const;
}

const CONSONANT_CLUSTERS = new Set(consonantClusters());

// ---------------------------------------------------------------------------
// Phoneme helpers
// ---------------------------------------------------------------------------

/** Returns true if the given CMUdict phonemes form a consonant cluster. */
export function checkIfConsonantCluster(phones: string): boolean {
  return CONSONANT_CLUSTERS.has(phones);
}

/** Returns true if the CMUdict phoneme is a vowel. */
export function checkIfVowel(phone: string): boolean {
  // All vowels in CMU Pronouncing Dictionary have stress number 0–2.
  return '012'.includes(phone.slice(-1));
}

/** Returns true if the CMUdict phoneme is a stressed vowel. */
export function checkIfStressedVowel(phone: string): boolean {
  return '12'.includes(phone.slice(-1));
}

/** Returns true if the CMUdict phoneme is a non-stressed vowel. */
export function checkIfNonStressedVowel(phone: string): boolean {
  return phone.endsWith('0');
}

/** Returns true if the CMUdict phoneme is a consonant. */
export function checkIfConsonant(phone: string): boolean {
  return !'012'.includes(phone.slice(-1));
}

// ---------------------------------------------------------------------------
// Collection helpers
// ---------------------------------------------------------------------------

/** Removes duplicates from an array while preserving insertion order. */
export function unique<T>(dataList: readonly T[]): T[] {
  return [...new Set(dataList)];
}

/** Returns true if every element in `dataList` equals `val`. */
export function allTheSame<T>(dataList: readonly T[], val: T): boolean {
  return dataList.length > 0 && dataList.every((item) => item === val);
}

// ---------------------------------------------------------------------------
// Phone retrieval helpers
// ---------------------------------------------------------------------------

/**
 * Chooses a random set of CMUdict phonemes for a word.
 * @returns Empty string if the word is not in the dictionary.
 */
export function randomPhonesForWord(word: string): string {
  const allPhones = pronouncing.phonesForWord(word);
  if (!allPhones || allPhones.length === 0) return '';
  const idx = Math.floor(Math.random() * allPhones.length);
  return allPhones[idx];
}

/**
 * Chooses the first set of CMUdict phonemes for a word.
 * @returns Empty string if the word is not in the dictionary.
 */
export function firstPhonesForWord(word: string): string {
  const allPhones = pronouncing.phonesForWord(word);
  if (!allPhones || allPhones.length === 0) return '';
  return allPhones[0];
}

// ---------------------------------------------------------------------------
// Core rhyme functions
// ---------------------------------------------------------------------------

/**
 * Returns a list of rhymes for a word.
 *
 * Conditions:
 *   1. Last stressed vowel and subsequent phonemes match.
 *
 * This is the "default" rhyme — equivalent to the Python `pronouncing`
 * module's `rhymes()` function, but with the identical word removed.
 */
export function rhyme(word: string, phones?: string): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const rhymingPart = pronouncing.rhymingPart(resolvedPhones);
  const lookup = pronouncing.rhymeLookup;
  const candidates: string[] = lookup.get(rhymingPart) ?? [];
  return candidates.filter((w) => w !== word);
}

/**
 * Returns a list of perfect rhymes for a word.
 *
 * Conditions:
 *   1. Last stressed vowel and subsequent phonemes match.
 *   2. Onset of the last stressed syllable is different.
 */
export function perfectRhyme(word: string, phones?: string): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const perfAndIdenRhymes = rhyme(word, resolvedPhones);
  const identicalRhymes = identicalRhyme(word, resolvedPhones);
  const identicalSet = new Set(identicalRhymes);

  let perfectRhymes = perfAndIdenRhymes.filter((r) => !identicalSet.has(r));
  perfectRhymes = perfectRhymes.filter((r) => r !== word);
  return perfectRhymes;
}

/**
 * Returns identical rhymes of a word.
 *
 * Conditions:
 *   1. Last stressed vowel and subsequent phonemes match.
 *   2. Onset of the last stressed syllable is the same.
 *
 * Example: "leave" and "believe" share the identical ending "-lieve".
 */
export function identicalRhyme(word: string, phones?: string): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const phonesList = resolvedPhones.split(' ');
  const searchList: string[] = [];

  for (let i = phonesList.length - 1; i >= 0; i--) {
    const phone = phonesList[i];

    if (!checkIfStressedVowel(phone)) {
      searchList.push(phone);
    } else {
      searchList.push(phone);
      const lastStressedVowelAtStart = i === 0;

      if (lastStressedVowelAtStart) {
        searchList.reverse();
        const search = searchList.join(' ') + '$';
        return pronouncing.search(search);
      } else {
        let consonantCnt = 0;
        let consonants = '';
        let searchStart = '';

        for (let j = i; j > 0; j--) {
          const nextPhone = phonesList[j - 1];
          if (checkIfConsonant(nextPhone)) {
            consonantCnt += 1;
            if (consonantCnt > 1) {
              consonants = nextPhone + ' ' + consonants;
              if (checkIfConsonantCluster(consonants)) {
                searchList.push(nextPhone);
              } else {
                break;
              }
            } else {
              consonants = nextPhone;
              searchList.push(nextPhone);
            }
          } else {
            if (consonantCnt === 0) {
              // null onset
              searchStart = '((..(0|1|2) )|^)';
            }
            break;
          }
        }

        searchList.reverse();
        const search = searchStart + searchList.join(' ') + '$';
        let rhymes = pronouncing.search(search);
        rhymes = unique(rhymes);
        return rhymes;
      }
    }
  }

  return [];
}

/**
 * Returns a list of words that almost rhyme.
 *
 * Conditions:
 *   1. At least one of the phonemes after and including the last stressed
 *      syllable match, except for the case where they all do.
 */
export function nearRhyme(
  word: string,
  phones?: string,
  options: NearRhymeOptions = {}
): string[] {
  const { stress = true, consonantTail = 0 } = options;

  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const rp = pronouncing.rhymingPart(resolvedPhones);
  const searchCombos = wildcardMixPhonesRegexSearches(rp, stress);
  let rhymes: string[] = [];

  for (const search of searchCombos) {
    rhymes = rhymes.concat(
      pronouncing.search(search + `( .{1,3}){0,${consonantTail}}$`)
    );
  }

  if (rhymes.length > 0) {
    rhymes = unique(rhymes);
    rhymes = rhymes.filter((r) => r !== word);
    return rhymes;
  }

  console.warn('nearRhyme: tried all combos, did not find anything!');
  return [];
}

/**
 * Returns a list of rhymes where a random combination of phonemes match.
 *
 * Conditions:
 *   1. Any possible phonetic similarity between the final stressed vowel
 *      and subsequent phonemes.
 */
export function randomGeneralRhyme(
  word: string,
  phones?: string,
  searchOption: SearchOption = 'end'
): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const rp = pronouncing.rhymingPart(resolvedPhones);
  let searchCombos = wildcardMixPhonesRegexSearches(rp);

  while (searchCombos.length > 0) {
    const idx = Math.floor(Math.random() * searchCombos.length);
    const search = searchCombos[idx];

    let rhymes: string[];
    if (searchOption === 'end') {
      rhymes = pronouncing.search(search + '$');
    } else if (searchOption === 'begin') {
      rhymes = pronouncing.search('^' + search);
    } else if (searchOption === 'whole') {
      rhymes = pronouncing.search('^' + search + '$');
    } else {
      throw new Error("searchOption should be 'end', 'begin', or 'whole'");
    }

    if (rhymes && rhymes.length > 0) {
      rhymes = unique(rhymes);
      rhymes = rhymes.filter((r) => r !== word);
      return rhymes;
    } else {
      searchCombos.splice(idx, 1);
    }
  }

  console.warn('randomGeneralRhyme: tried all combos, did not find anything!');
  return [];
}

/**
 * Returns words that match a random combination of phonemes.
 *
 * Like `randomGeneralRhyme`, but applies to the entire word rather than
 * just the last syllable portion.
 */
export function randomMatchPhones(word: string, phones?: string): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error('phonemes and word do not match');
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  let searchList = wildcardMixPhonesRegexSearches(resolvedPhones);

  while (searchList.length > 0) {
    const idx = Math.floor(Math.random() * searchList.length);
    const search = searchList[idx];
    let rhymes = pronouncing.search(search);

    if (rhymes && rhymes.length > 0) {
      rhymes = unique(rhymes);
      rhymes = rhymes.filter((r) => r !== word);
      return rhymes;
    } else {
      searchList.splice(idx, 1);
    }
  }

  console.warn('randomMatchPhones: tried all combos, did not find anything!');
  return [];
}

// ---------------------------------------------------------------------------
// Slant rhyme functions
// ---------------------------------------------------------------------------

/**
 * Returns slant rhymes defined by assonance (matching vowels).
 *
 * Conditions:
 *   1. The last stressed vowel and subsequent phonemes match all vowels.
 */
export function assonanceSlantRhyme(word: string, phones?: string): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const phonesList = resolvedPhones.split(' ');
  const searchList: string[] = [];

  for (let i = phonesList.length - 1; i >= 0; i--) {
    const phone = phonesList[i];

    if (checkIfNonStressedVowel(phone)) {
      searchList.push(phone.slice(0, 2) + '.');
    } else if (checkIfStressedVowel(phone)) {
      searchList.push(phone.slice(0, 2) + '.'); // ignore stress
      searchList.reverse();
      const search = searchList.join(' ') + '$';
      let rhymes = pronouncing.search(search);
      rhymes = unique(rhymes);
      rhymes = rhymes.filter((r) => r !== word);
      return rhymes;
    } else if (checkIfConsonant(phone)) {
      searchList.push('.{1,3}');
    }
  }

  return [];
}

/**
 * Returns slant rhymes defined by consonance (matching consonants).
 *
 * Conditions:
 *   1. The last stressed vowel and subsequent phonemes match all consonants.
 */
export function consonanceSlantRhyme(word: string, phones?: string): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  const phonesList = resolvedPhones.split(' ');
  const searchList: string[] = [];

  for (let i = phonesList.length - 1; i >= 0; i--) {
    const phone = phonesList[i];

    if (checkIfStressedVowel(phone)) {
      searchList.push('.{1,3}');
      if (allTheSame(searchList, '.{1,3}')) break;
      searchList.reverse();
      const search = searchList.join(' ') + '$';
      let rhymes = pronouncing.search(search);
      rhymes = unique(rhymes);
      rhymes = rhymes.filter((r) => r !== word);
      return rhymes;
    } else if (checkIfNonStressedVowel(phone)) {
      searchList.push('.{1,3}');
    } else if (checkIfConsonant(phone)) {
      searchList.push(phone);
    }
  }

  return [];
}

// ---------------------------------------------------------------------------
// Assonance & consonance (general)
// ---------------------------------------------------------------------------

/**
 * Returns words that have assonance with the input word.
 *
 * @param word          Word that should be in the CMU Pronouncing Dictionary.
 * @param phones        Specific phonemes to match (default: first pronunciation).
 * @param searchDirection  Direction of match ('forward', 'backward', or null).
 * @param matchLimit    Limit the number of phonemes to match.
 */
export function assonance(
  word: string,
  phones?: string,
  searchDirection: SearchDirection = null,
  matchLimit: number | null = null
): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error(`${phones} not phones for ${word}`);
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  let phonesList = resolvedPhones.split(' ');
  if (searchDirection === 'backward') {
    phonesList = [...phonesList].reverse();
  }

  const searchList: string[] = [];
  let matchCnt = 0;

  for (const phone of phonesList) {
    if (checkIfConsonant(phone)) {
      searchList.push('.');
    } else if (checkIfVowel(phone)) {
      searchList.push(phone);
      matchCnt += 1;
      if (matchLimit !== null && matchCnt === matchLimit) break;
    }
  }

  let search: string;
  if (searchDirection === 'backward') {
    search = [...searchList].reverse().join(' ') + '$';
  } else if (searchDirection === 'forward') {
    search = '^' + searchList.join(' ');
  } else {
    search = searchList.join(' ');
  }

  let rhymes = pronouncing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * Returns words that have consonance with the input word.
 *
 * @param word          Word that should be in the CMU Pronouncing Dictionary.
 * @param phones        Specific phonemes to match (default: first pronunciation).
 * @param searchDirection  Direction of match ('forward', 'backward', or null).
 * @param matchLimit    Limit the number of phonemes to match.
 */
export function consonance(
  word: string,
  phones?: string,
  searchDirection: SearchDirection = null,
  matchLimit: number | null = null
): string[] {
  let resolvedPhones: string;

  if (phones === undefined) {
    resolvedPhones = firstPhonesForWord(word);
    if (resolvedPhones === '') return [];
  } else {
    const allPhones = pronouncing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      throw new Error('phonemes and word do not match');
    }
    resolvedPhones = phones;
  }

  if (!resolvedPhones) {
    throw new Error('phonemes string is empty');
  }

  let phonesList = resolvedPhones.split(' ');
  if (searchDirection === 'backward') {
    phonesList = [...phonesList].reverse();
  }

  const searchList: string[] = [];
  let matchCnt = 0;

  for (const phone of phonesList) {
    if (checkIfVowel(phone)) {
      searchList.push('.{1,3}');
    } else if (checkIfConsonant(phone)) {
      searchList.push(phone);
      matchCnt += 1;
      if (matchLimit !== null && matchCnt === matchLimit) break;
    }
  }

  let search: string;
  if (searchDirection === 'backward') {
    search = [...searchList].reverse().join(' ') + '$';
  } else if (searchDirection === 'forward') {
    search = '^' + searchList.join(' ');
  } else {
    search = searchList.join(' ');
  }

  let rhymes = pronouncing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * Returns words that alliterate with the input word.
 * (Consonance matching from the start, limited to 1 phoneme.)
 */
export function alliteration(word: string): string[] {
  return consonance(word, undefined, 'forward', 1);
}

// ---------------------------------------------------------------------------
// Regex / wildcard helpers
// ---------------------------------------------------------------------------

/**
 * Generates all combinations of regex strings where each phoneme in `phones`
 * is optionally replaced with a wildcard ('.{1,3}').
 *
 * Example output for "HH IY1 R":
 *   ['HH IY1 R', 'HH IY1 .{1,3}', 'HH .{1,3} R', ...]
 */
export function wildcardMixPhonesRegexSearches(
  phones: string,
  stress = false
): string[] {
  const phonesList = phones.split(' ');
  const productFactors: string[][] = [];

  for (const phone of phonesList) {
    const flist: string[] = ['.{1,3}'];
    if (!stress && checkIfVowel(phone)) {
      flist.push(phone.slice(0, 2) + '.'); // ignore stress
    } else {
      flist.push(phone);
    }
    productFactors.push(flist);
  }

  // Cartesian product
  const combos = cartesianProduct(productFactors);
  // Remove the all-wildcard case
  const allWildcard = combos[0];
  const filtered = combos.filter((c) => c !== allWildcard);

  return filtered.map((item) => item.join(' '));
}

/** Cartesian product of arrays. */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
    [[]]
  );
}

// ---------------------------------------------------------------------------
// Random / convenience functions
// ---------------------------------------------------------------------------

/**
 * Returns a rhyme whose stress pattern matches the input word's stress.
 * Falls back to any rhyme after 10 attempts.
 */
export function rhymeSameStress(word: string): string {
  let timeoutTimer = 0;

  while (true) {
    const phones = pronouncing.phonesForWord(word);
    const phone = phones[Math.floor(Math.random() * phones.length)];
    const wordStress = pronouncing.stresses(phone);
    const rhyme = rhymeTypeRandom(word);

    const rhymePhones = pronouncing.phonesForWord(rhyme);
    for (const rp of rhymePhones) {
      const rhymeStress = pronouncing.stresses(rp);
      if (wordStress === rhymeStress) {
        return rhyme;
      }
    }

    if (timeoutTimer === 10) {
      return rhyme;
    }
    timeoutTimer += 1;
  }
}

/**
 * Finds a word that shares phonemes with the input phonemes.
 *
 * @param phones     CMUdict phonemes string.
 * @param wordList   Optional list of words to limit the search to.
 * @param simPerc    Threshold for similarity (default: 0.25).
 */
export function simWordForPhones(
  phones: string,
  wordList: string[] = [],
  simPerc = 0.25
): string | null {
  const searchCombos = wildcardMixPhonesRegexSearches(phones);
  shuffleInPlace(searchCombos);

  for (const sch of searchCombos) {
    const schList = sch.split(' ');
    if (schList.filter((s) => s === '.{1,3}').length < (1 - simPerc) * schList.length) {
      let matches = pronouncing.search('^' + sch + '$');
      if (matches && matches.length > 0) {
        matches = unique(matches);
        shuffleInPlace(matches);
        for (const m of matches) {
          if (wordList.length > 0) {
            if (wordList.includes(m)) return m;
          } else {
            return m;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Returns a random rhyme of any supported type.
 * Tries each type in random order until one yields results.
 */
export function rhymeTypeRandom(word: string): string {
  const rhymeTypes: RhymeType[] = [
    'perfect',
    'identical',
    'random_match_phones',
    'random_general',
    'assonance',
    'consonance',
    'slant_assonance',
    'slant_consonance',
  ];

  const workingTypes = [...rhymeTypes];

  while (workingTypes.length > 0) {
    const idx = Math.floor(Math.random() * workingTypes.length);
    const rt = workingTypes[idx];
    let rhymes: string[] = [];

    switch (rt) {
      case 'perfect':
        rhymes = perfectRhyme(word);
        break;
      case 'identical':
        rhymes = identicalRhyme(word);
        break;
      case 'random_match_phones':
        rhymes = randomMatchPhones(word);
        break;
      case 'random_general':
        rhymes = randomGeneralRhyme(word);
        break;
      case 'assonance':
        rhymes = assonance(word);
        break;
      case 'consonance':
        rhymes = consonance(word);
        break;
      case 'slant_assonance':
        rhymes = assonanceSlantRhyme(word);
        break;
      case 'slant_consonance':
        rhymes = consonanceSlantRhyme(word);
        break;
    }

    if (rhymes.length > 0) {
      return rhymes[Math.floor(Math.random() * rhymes.length)];
    } else {
      workingTypes.splice(idx, 1);
    }
  }

  return '';
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle (in-place). */
function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
