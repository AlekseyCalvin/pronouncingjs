
# Pronouncing.js 
##Intro, Tutorial, and Reference

The **Pronouncing** library, for [Python](https://github.com/aparrish/pronouncingpy) and [JavaScript](https://github.com/aparrish/pronouncingjs), is a work of [Allison Parrish](https://www.decontextualize.com/), the living legend of [auto-frankensteining](https://github.com/aparrish/shoestrings/blob/main/shoestrings-tutorial.ipynb) [poetics](https://posts.decontextualize.com/solar-powered-dawn-poems-progress-report/). <br>

Parrish describes **Pronouncing** as a "simple interface to the [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)", but is clearly being too modest. <br>

**Pronouncing** "interfaces" the CMU dictionary from top to bottom, bottom to top, inside and out, from inside any output, or vice versa, or whilst revising, or versing, while somersaulting on a tightrope with an arsenal of magic wands, selectively, tactically, like a piece of software, and in most other ways... probably... or at least probabilistically.

This document serves as a reference specifically for the JavaScript (Node.js) version of `Pronouncing`. It is adapted from [Parrish's O.G. tutorial](https://github.com/aparrish/pronouncingpy/blob/master/docs/tutorial.rst) for the [Python version](https://github.com/aparrish/pronouncingpy), translated to fit the JavaScript API; primarily via converting function names into the camelCase, as per Parrish's note on the [pronouncingjs repository door](https://github.com/aparrish/pronouncingjs). <br>

## Installation and Setup

*Node.js*
---------------
To use the library in Node.js, install it directly from the GitHub repository as specified in the original documentation:

```bash
npm install aparrish/pronouncingjs
```

To use directly in your terminal, launch 'node'. <br>

Then you ought to 'require' the library in your script (or the CLI/Terminal for iterative or exploratory usage). <br>
The dictionary data is loaded automatically upon the first call to a function that requires it.

```javascript
const pronouncing = require('pronouncing');
```
Or:

```javascript
var pronouncing = require('pronouncing');
```

*Browser* (Web Pages)
---------------

If you are building a website, you do not need `Node.js` or `npm`. <br>
You use the pre-compiled "browserified" build. <br>

1.  **Download** [the file `pronouncing-browser.js`](https://github.com/aparrish/pronouncingjs/blob/master/build/pronouncing-browser.js) from the repository's `build/` directory.
2.  **Place** it in your web project folder (e.g., `/js/pronouncing-browser.js`).
3.  **Include** it in your HTML file using a `<script>` tag.

**Example HTML Usage:**
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Include the library -->
    <script src="js/pronouncing-browser.js"></script>
</head>
<body>
    <script>
        // The library is now available as a global variable 'pronouncing'
        var phones = pronouncing.phonesForWord("hello");
        console.log(phones);
    </script>
</body>
</html>
```

*Note: In the browser environment, you use `var` or `window.pronouncing` to access the library, as `require` is not available unless you are using a bundler like Webpack or Browserify yourself.*

---

## Core Functions

### Word Pronunciations

To get the pronunciation for a given word, use the `phonesForWord` function. <br> 
It returns an array of all pronunciations found in the CMU pronouncing dictionary. <br>

**Function:** `pronouncing.phonesForWord(word)` <br>
* **Input:** `string` (word) <br>
* **Returns:** `Array<string>` (phones) <br>

Returns an array of pronunciation strings for the given word. <br>
Pronunciations are given using a special phonetic alphabet known as ARPAbet. <br> 

```javascript
> pronouncing.phonesForWord("permit");
[ 'P ER0 M IH1 T', 'P ER1 M IH2 T' ]
```

```javascript
pronouncing.phonesForWord("adverse")
// [ 'AE0 D V ER1 S', 'AE1 D V ER2 S', 'AE2 D V ER1 S' ]
```

Each token in a pronunciation string is called a "phone." <br> 
The numbers after the vowels indicate the degree of its stress in a normative pronounciation. <br> 
*   `1` indicates **primary stress**  <br> 
*   `2` indicates **secondary stress** <br> 
*   `0` indicates **unstressed** <br> 
This vowel-stress typically corresponds to the syllabic stress within a word. <br>
And syllabic stress is the primary measure of phonetic/prosodic meter (which may or may not exactly align with poetic meters, but that's its own distinct and specialized problematic which this library is not equipped to handle in and of itself). <br>

Sometimes, the CMU pronouncing dictionary offers more than one pronunciation for the same word. <br>
"Permit" is a good example: it can be pronounced either with the stress on the first syllable (*"do you have a permit to program here?"*) or on the second syllable (*"will you permit me to program here?"*). <br> 
For this reason, the `phonesForWord` function returns a list of possible pronunciations.  <br>
(You'll need to come up with your own criteria for deciding which pronunciation is best for your purposes.)

Pronunciations use the ARPAbet phonetic alphabet. Numbers after vowels indicate stress: <br>
*   `1`: Primary stress <br>
*   `2`: Secondary stress <br>
*   `0`: Unstressed <br>

### Counting Syllables

**Function:** `pronouncing.syllableCount(phones)` <br>
Counts the number of syllables in a phone string. <br>
*   **Input:** `string` (phones) <br>
*   **Returns:** `number` <br>

To count syllables in a word (or text), pass a string of phones to the `syllableCount` function. <br>
In practice (unless you've gots some ready-made phones), we would be chaining-up 'phonesForWord'  and 'syllableCount'. <br>
This could be done in one of several ways. <br>

The most obvious way to do this would be via a compact one-liner like:
```javascript
> pronouncing.syllableCount(pronouncing.phonesForWord("programming")[0])
3
```
Or:
```javascript
pronouncing.syllableCount(pronouncing.phonesForWord("adverse")[0])
// 2
```
Another way is to explicitly define the output of 'phonesForWord' as 'phones' and pass it to 'syllableCount'. <br>
This could be the way to go if you're trying to do multiple things with these phones. Like this: <br>

```javascript
> const phones = pronouncing.phonesForWord("purple")[0];
> pronouncing.syllableCount(phones);
// 2
> pronouncing.stresses(phones);
// 10
> pronouncing.rhymingPart(phones)
// 'ER1 P AH0 L'
```
*But note that a* 'const' *binding is immutable within a certain range. So, don't expect to immediately reattach 'phones' to some other word or sequence!* <br>
*As such, in many cases it may be better to use* 'let' *instead of* 'const'. *After all:*
```javascript
> let phonetic = pronouncing.phonesForWord("programming")[0]; 
> pronouncing.stresses(phonetic)
// '120'
> phonetic = pronouncing.phonesForWord("whirling")[0];
// 'W ER1 L IH0 NG'
```

Beyond this, one can pass a function call directly inside `syllableCount` (compact style) or store the result in a variable (expanded style). <br> 
Using `let` allows you to check the phones before counting. <br>

**Compact Style:**
```javascript
> pronouncing.syllableCount(pronouncing.phonesForWord("programming")[0])
3
```

**Expanded Style (Exploratory: real-time CLI/Terminal-use, etc...):**
```javascript
> let phones = pronouncing.phonesForWord("programming")[0];
> phones
'P R OW1 G R AE2 M IH0 NG'
> pronouncing.syllableCount(phones)
3
```

On side note, many words in the CMU dictionary are polyphonetic:

```javascript
> let phones = pronouncing.phonesForWord("permit");
> phones
[ 'P ER0 M IH1 T', 'P ER1 M IH2 T' ]

> phones = pronouncing.phonesForWord("record");
[ 'R EH1 K ER0 D', 'R IH0 K AO1 R D' ]
```

---
## Tutorial: Common Tasks

### 1. Calculating Most Common Sounds

You can iterate through a text to count the frequency of specific phones. <br>
Since JavaScript does not have a built-in `Counter` like Python, we can use a `Map` or an object to aggregate counts.

```javascript
const pronouncing = require('pronouncing');

let text = "april is the cruelest month breeding lilacs out of the dead";
let counts = {};
let words = text.split(" ");

for (let word of words) {
    let pronunciationList = pronouncing.phonesForWord(word);
    if (pronunciationList.length > 0) {
        let phones = pronunciationList[0].split(" ");
        for (let phone of phones) {
            counts[phone] = (counts[phone] || 0) + 1;
        }
    }
}

// Sorting and printing the top 5 phones
// (This snippet converts the object to an array, sorts it, and slices it)
let sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log(sortedCounts.slice(0, 5));
```

**Output of the 5 most common sounds/phones in the above verse-line:**
```javascript
[ [ 'AH0', 4 ], [ 'L', 4 ], [ 'D', 3 ], [ 'R', 3 ], [ 'DH', 2 ] ]
```

### 2. Pronunciation Search

**Function:** `pronouncing.search(pattern)` <br>
*   **Input:** `string | RegExp` <br>
*   **Returns:** `Array<string>` (matching words) <br>

**Behavior:** <br>
*   If `pattern` is a **String**: The library automatically wraps it with word boundaries (`\b` at start and end). <br>
*   If `pattern` is a **RegExp**: The library uses the regex as-is. You must add your own boundaries if needed. <br>

The `search` function finds words whose pronunciation matches a regular expression. <br> 
Word boundaries (`\b`) are added automatically. <br>

```javascript
// String input (automatic boundaries)
pronouncing.search("^S K R AE1")
// ['scrabble', 'scragg', 'scraggle', ...]

// RegExp input (manual control)
pronouncing.search(/\bIH. \w* IH. \w* IH. \w* IH.\b/)
// ['definitive', 'definitively', ...]
```

Finding words containing the sounds for "sighs":

```javascript
> const phones = pronouncing.phonesForWord("sighs")[0];
> pronouncing.search(phones).slice(0, 5);
[ 'incise', 'incised', 'incisor', 'incisors', 'malloseismic' ]
```

A CLI/terminal-oriented example with 'let'-style variable binding:

```javascript
> let matches = pronouncing.search("^S K R AE1");
> matches.slice(0, 3);
[ 'scrabble', 'scragg', 'scraggle' ]

// Reuse 'matches' for a different search
> matches = pronouncing.search("IH1 D AH0 L$");
> matches.slice(0, 3);
[ 'biddle', 'criddle', 'fiddle' ]
```

Finding words ending in "-iddle" (using regex `$`):

```javascript
> pronouncing.search("IH1 D AH0 L$").slice(0, 5);
[ 'biddle', 'criddle', 'fiddle', 'friddle', 'kiddle' ]
```

Or without the `.slice(0, 5)` (which just abridges the output to the first 5 matches):
```javascript
pronouncing.search("IH1 D AH0 L$")
[
  'biddle',  'criddle', 'fiddle',
  'friddle', 'kiddle',  'liddell',
  'liddle',  'middle',  'piddle',
  'riddell', 'riddle',  'rydell',
  'schmidl', 'siddall', 'siddell',
  'siddle',  'spidel',  'spidell',
  'twiddle', 'widdle',  'widell'
]
```

** Comples Example: Rewriting text based on first two phones**
-------------
*This rewrites an input text using words that share the first two phones with the input words.* <br>

**Code:**
```javascript
let text = 'april is the cruelest month breeding lilacs out of the dead';
let out = [];

text.split(" ").forEach(word => {
    let phones = pronouncing.phonesForWord(word);
    if (phones.length > 0) {
        let first2 = phones[0].split(" ").slice(0, 2).join(" ");
        // Search for words starting with these two phones
        let matches = pronouncing.search("^" + first2);
        if (matches.length > 0) {
            // Pick a random match
            let randomMatch = matches[Math.floor(Math.random() * matches.length)];
            out.push(randomMatch);
        } else {
            out.push(word);
        }
    } else {
        out.push(word);
    }
});

console.log(out.join(" "));
```

**Output (Example):**
```text
apec's isn't them kraatz muffy bronte leichliter outpacing of than delfs
```

*Advanced Search with Regex*
--------------
Finding words that match specific phonetic constraints. <br> 
The `search` function allows you to pass a compiled `RegExp` for complex logic.

```javascript
// Finding words matching a complex pattern:
// Below: The phone "IH" + any char, repeated a few times...
const pattern = /\bIH. \w* IH. \w* IH. \w* IH.\b/;
const matches = pronouncing.search(pattern);
// ['definitive', 'definitively', 'diminishes', ...]
```

### 3. Meter and Stress Patterns

**Function:** `pronouncing.stresses(phones)` <br>
*   **Input:** `string` (phones)  <br>
*   **Returns:** `string`  <br>
Using `stresses` extracts the stress pattern of a phone string (returns a string of digits `0`, `1`, `2`). <br>

```javascript
> const phones = pronouncing.phonesForWord("snappiest")[0];
> pronouncing.stresses(phones);
'102'
```

Use `searchStresses` to find words matching a specific stress pattern regex. <br>

**Function:** `pronouncing.searchStresses(pattern)` <br>
*   **Input:** `string` <br>
*   **Returns:** `Array<string>` <br>
*   **Note:** Word boundaries (`\b`) are automatically added. <br>

Finding words that fit a specific meter (e.g., anapestic words). <br>

```javascript
// Finding words with stress pattern: unstressed, unstressed, stressed (anapest)
// at the end of the word.
const results = pronouncing.searchStresses("001$");
// ['understand', 'overcome', ...]
```

Or simply:
```javascript
> pronouncing.searchStresses("001$")
[
  'abidjan',    'adoree',      'adorees',     'adrienne',    'aguillon',
  'aladeen',    'aleron',      'alleyoop',    'almaguer',    'almanzar',
  'almazan',    'almelund',    'amadon',      'amaral',      'andujar',
  'appointee',  'appointees',  'aquilar',     'armentor',    'arreguin',
  'augustin',   'avelar',      'avenall',     'avenel',      'avenell',
  'averill',    'balaban',     'baldemar',    'baltazar',    'balthazor',
  'banderas',   'becerril',    'bensenyore',  'bernadette',  'bernadine',
  'bordenave',  'cadogan',     'carbajal',    'carreon',     'carvajal',
  'casebeer',   'chandelier',  'chelyabinsk', 'christiane',  'christianne',
  'comandeer',  'comandeered', 'comandeers',  'couvillion',  'couvillon',
  'dameron',    'dauphinee',   'davignon',    'deguzman',    'delamar',
  'delosreyes', 'demaree',     'desecrate',   'desecrate',   'desecrates',
  'desecrates', 'deverell',    'disabuse',    'disabuse',    'disabused',
  'disagree',   'disagreed',   'disagrees',   'disapproves', 'disbelieve',
  'disconnect', 'disconnects', 'discontent',  'disembark',   'disengage',
  'disengaged', 'disharoon',   'disinfect',   'disinform',   'disinvite',
  'dolezal',    'dominique',   'doralin',     'dorion',      'dunlavey',
  'erbakan',    "erbakan's",   'erion',       'esquibel',    'esquivel',
  'fatheree',   'gabaldon',    'geraldine',   'groseclose',  'hammontree',
  'hardegree',  'hardigree',   'hargadon',    'hocevar',     'hohensee',
  ... 162 more items
]
```

*Reminder: append* `.slice(#, #)` *to the function to specify how many matches you want outputted, or which segment/slice of the output range.* <br>

Finding words with two dactyls (`100100`):

```javascript
> pronouncing.searchStresses("100100");
[ 'afroamerican', 'afroamericans', 'interrelationship', 'overcapacity' ]
```

Finding words consisting of two anapests (`^00[12]00[12]$`):

```javascript
> pronouncing.searchStresses("^00[12]00[12]$");
[ 'neopositivist', 'undercapitalize', 'undercapitalized' ]
```

**Complex Example: Meter (Stress Pattern Rewrite)**
------
*This rewrites text by matching stress patterns.* <br>

**Code:**
```javascript
let text = 'april is the cruelest month breeding lilacs out of the dead';
let out = [];

text.split(" ").forEach(word => {
    let pronunciations = pronouncing.phonesForWord(word);
    if (pronunciations.length > 0) {
        let pat = pronouncing.stresses(pronunciations[0]);
        // Find words with the exact same stress pattern
        let matches = pronouncing.searchStresses("^" + pat + "$");
        if (matches.length > 0) {
            let randomMatch = matches[Math.floor(Math.random() * matches.length)];
            out.push(randomMatch);
        } else {
            out.push(word);
        }
    } else {
        out.push(word);
    }
});

console.log(out.join(" "));
```

**Output (Example):**
```text
joneses kopf whats rathbun p's gavan midpoint nill goh the pont's
```

### 4. Rhyme

**Function:** `pronouncing.rhymes(word)` <br>
*   **Input:** `string` (word) <br>
*   **Returns:** `Array<string>` (rhyming words) <br>
Use `rhymes` to get a list of words that rhyme with the input word. It checks all pronunciations of the input.

```javascript
> pronouncing.rhymes("failings");
[ 'mailings', 'railings', 'tailings' ]
```

```javascript
pronouncing.rhymes("sinking")
// [ 'blinking', 'drinking', 'linking', ... ]
```

**Checking whether a word rhymes with another:**
---------
```javascript
> pronouncing.rhymes("cheese").includes("wheeze");
true
> pronouncing.rhymes("cheese").includes("geese");
false
```

**Extracting the end-rhyme portion of a word's phones:** <br>
-------
**Function:** `pronouncing.rhymingPart(phones)` <br>
*   **Input:** `string` (phones) It checks all pronunciations of the input. <br>
*   **Returns:** `string` <br>
Extracts the "rhyming part" of a pronunciation (the vowel and following consonants of the last stressed syllable). <br>

```javascript
const phones = pronouncing.phonesForWord("sleekly")[0]; // "S L IY1 K L IY0"
pronouncing.rhymingPart(phones);
// "IY1 K L IY0"
```

```javascript
> const phones = pronouncing.phonesForWord("purple")[0];
> pronouncing.rhymingPart(phones);
'ER1 P AH0 L'
```

Finding words that rhyme with 'purple':

```javascript
> let phones = pronouncing.phonesForWord("purple")[0];
> let rhymePart = pronouncing.rhymingPart(phones);
> rhymePart
'ER1 P AH0 L'

// Now find words that match that specific part
> pronouncing.search(rhymePart + "$")
[ 'circle', 'hurtle', 'kerfuffle', ... ]
```

**Advanced Rhyming with `rhymingPart`:** <br>
---------
If you need to find rhymes for a specific pronunciation, extract the "rhyming part" using `rhymingPart` and pass it to `search`. <br>

```javascript
> const pronunciations = pronouncing.phonesForWord("uses");
> const sss = pronouncing.rhymingPart(pronunciations[0]); // 'UW1 S IH0 Z'
> const zzz = pronouncing.rhymingPart(pronunciations[1]); // 'Y UW1 S IH0 Z'

// Find rhymes for the first pronunciation
> pronouncing.search(sss + "$").slice(0, 5);
[ "bruce's", 'juices', 'medusas', 'produces', "tuscaloosa's" ]

// Find rhymes for the second pronunciation
> pronouncing.search(zzz + "$").slice(0, 5);
[ 'abuses', 'cabooses', 'disabuses', 'excuses', 'induces' ]
```

**Complex Example: Rhyme** <br>
-------------
*The following example rewrites a text, replacing each word with a rhyming word (when a rhyming word is available in the CMU dictionary).* <br>

**Code:**
```javascript
let text = 'april is the cruelest month breeding lilacs out of the dead';
let out = [];

text.split(" ").forEach(word => {
    let rhymes = pronouncing.rhymes(word);
    if (rhymes.length > 0) {
        let randomRhyme = rhymes[Math.floor(Math.random() * rhymes.length)];
        out.push(randomRhyme);
    } else {
        // If no rhymes found, keep the original word
        out.push(word);
    }
});

console.log(out.join(" "));
```

**Output (Example):**
```text
april wiles's duh coolest month ceding pontiac's krout what've worthey wehde
```

### 5. Counting Syllables in Longer Texts
*This calculates the total syllable count for a string of text.*

**Code:**
```javascript
let text = "april is the cruelest month breeding lilacs out of the dead";

// Map words to phones, then map phones to counts, then sum
let totalSyllables = text.split(" ").reduce((sum, word) => {
    let phones = pronouncing.phonesForWord(word);
    if (phones.length > 0) {
        return sum + pronouncing.syllableCount(phones[0]);
    }
    return sum;
}, 0);

console.log(totalSyllables);
```

**Output:**
```text
15
```
---

### 6.Additional API Reference

**`search(pattern)` vs `searchStresses(pattern)`** <br>
-----------
*   `search`: Matches against the full phone string (e.g., `"P ER1 M IH2 T"`). Automatically adds word boundaries. <br>
*   `searchStresses`: Matches against the stress pattern string (e.g., `"12"`). Does not add word boundaries automatically, allowing you to use anchors (`^`, `$`) as needed. <br>

**`parseCMU(str)`** <br>
-----------
*   **Input:** `string` (CMU file content)
*   **Returns:** `Array<Array<string>>` (list of `[word, phones]` tuples)
Parses a string containing CMU dictionary data. <br>
Useful for loading custom dictionaries, though the library loads the default dictionary automatically on startup. <br>

```javascript
const data = "ADOLESCENT  AE2 D AH0 L EH1 S AH0 N T";
const parsed = pronouncing.parseCMU(data);
// [['adolescent', 'AE2 D AH0 L EH1 S AH0 N T']]
```

### 7. Next Steps

Hopefully this is only the beginning of your rhyme&meter-filled journey! <br> 
`Pronouncing` is just one possible interface for the CMU pronouncing dictionary, and you may find that for your particular purposes, a more specialized approach is necessary. <br>
In that case, feel free to peruse the library's [source code](http://github.com/aparrish/pronouncingpy) for helpful hints and tidbits.