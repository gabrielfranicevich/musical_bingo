import { STOPWORDS } from './stopwords.js';

const isTooSimilar = (w1, w2) => {
  let matchCount = 0;
  for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
    if (w1[i] === w2[i]) matchCount++;
    else break;
  }
  // If they share at least 4 starting letters AND that makes up the majority (>50%) 
  // of the shorter word, they are essentially the same word form.
  return matchCount >= 4 && matchCount > Math.min(w1.length, w2.length) * 0.5;
};

const isValidWord = (w, originalWord) => {
  const cw = w.toLowerCase().trim();
  const co = originalWord.toLowerCase().trim();

  return cw.length > 2 &&           // block single chars / noise
    /^[a-záéíóúüñ\s]+$/.test(cw) && // only letters and spaces
    !STOPWORDS.has(cw) &&
    !cw.includes(co) &&
    !co.includes(cw) &&
    !isTooSimilar(cw, co);
};

/** Pick a random item from an array */
const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

export const generateHints = async (word, count = 1) => {
  if (!word || count <= 0) return [];

  let results = [];
  let attempts = 0;
  const maxAttempts = 3;

  while (results.length < count && attempts < maxAttempts) {
    const needed = count - results.length;
    let textResult = null;

    try {
      // need at least ${needed} hints to be generated, so i cant use a constant
      const prompt = needed > 1 ?
        `Dada '${word}', dame ${needed} asociaciones de 1-2 palabras o 1 onomatopeya que NO sean sinónimos directos, pero que una persona podría conectar en 2 o 3 saltos mentales. Devuelve solamente una lista separada por comas.` :
        `Dada '${word}', dame ${needed} asociacion de 1-2 palabras o 1 onomatopeya que NO sea sinónimo directo, pero que una persona podría conectar en 2 o 3 saltos mentales. Devuelve solamente la asosiación.`;

      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const hfKey = import.meta.env.VITE_HF_API_KEY;

      if (geminiKey) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 60 }
            })
          });
          if (response.ok) {
            const data = await response.json();
            textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
          }
        } catch (err) {
          console.warn('Gemini failed in attempt...', err);
        }
      }

      if (!textResult && hfKey) {
        try {
          // Use the proxy to avoid CORS errors on the frontend
          const response = await fetch("/api/hf-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, token: hfKey })
          });

          if (response.ok) {
            const data = await response.json();
            textResult = data[0]?.generated_text;
          } else {
            console.warn('Hugging Face returned non-ok status');
          }
        } catch (err) {
          console.warn('Hugging Face failed in attempt...', err);
        }
      }

      if (textResult) {
        // Clean up the response (remove quotes, brackets, etc.) and uppercase it
        const parts = textResult.split(',')
          .map(s => s.trim().replace(/^["'\-\*\.]+|["'\-\*\.]+$/g, '').toUpperCase())
          .filter(Boolean); // keep non-empty string

        for (const p of parts) {
          // all words are valid for ia, the stopwords are not needed
          if (!results.includes(p)) results.push(p);
          if (results.length >= count) break;
        }
      } else {
        // Both APIs failed or returned nothing
        break;
      }
    } catch (error) {
      console.warn('AI hint generation failed, breaking loop to use fallback:', error);
      break;
    }

    attempts++;
  }

  // Backfill mathematically if the AI didn't provide enough valid hints
  if (results.length < count) {
    const needed = count - results.length;
    const fallbacks = await getFallbackHints(word, needed);
    for (const f of fallbacks) {
      if (!results.includes(f)) results.push(f);
      if (results.length >= count) break;
    }
  }

  return results.slice(0, count);
};

const getFallbackHints = async (word, count) => {
  try {
    const fetchPromises = [
      // 1. Wikipedia Definition
      fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 2. Datamuse Synonyms/Related
      fetch(`https://api.datamuse.com/words?v=es&ml=${encodeURIComponent(word)}&max=20`)
        .then(r => r.ok ? r.json() : []).catch(() => []),

      // 3. Wiktionary Extract
      fetch(`https://es.wiktionary.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(word)}&format=json&explaintext=1&origin=*`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 4. DuckDuckGo Instant Answers
      fetch(`/api/ddg-proxy?q=${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 5. Wikidata Description
      fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(word)}&language=es&uselang=es&format=json&origin=*`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 6. Local Server Proxy (Slang dicts bypass)
      fetch(`/api/scrape-slang?w=${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({}))
    ];

    const [wikiData, datamuseData, wiktData, ddgData, wdData, slangData] = await Promise.all(fetchPromises);
    let allWords = [];

    if (wikiData.description || wikiData.extract) {
      const text = (wikiData.description || '') + ' ' + (wikiData.extract || '');
      allWords.push(...text.split(/[\s,.;:()"']+/).map(w => w.toLowerCase()).filter(w => isValidWord(w, word)).slice(0, 20));
    }
    if (Array.isArray(datamuseData) && datamuseData.length > 0) {
      allWords.push(...datamuseData.map(d => d.word).filter(w => isValidWord(w, word)));
    }
    if (wiktData?.query?.pages) {
      const ObjectValues = Object.values(wiktData.query.pages);
      if (ObjectValues.length > 0 && ObjectValues[0].extract) {
        allWords.push(...ObjectValues[0].extract.split(/[\s,.;:()"'{}\[\]]+/).map(w => w.toLowerCase()).filter(w => isValidWord(w, word)).slice(0, 20));
      }
    }
    if (ddgData?.AbstractText || ddgData?.RelatedTopics?.length > 0) {
      const related = (ddgData.RelatedTopics || []).map(t => t.Text || '').join(' ');
      const text = (ddgData.AbstractText || '') + ' ' + related;
      allWords.push(...text.split(/[\s,.;:()"'{}\[\]]+/).map(w => w.toLowerCase()).filter(w => isValidWord(w, word)).slice(0, 20));
    }
    if (wdData?.search?.length > 0) {
      const text = wdData.search[0].description || '';
      allWords.push(...text.split(/[\s,.;:()"'{}\[\]]+/).map(w => w.toLowerCase()).filter(w => isValidWord(w, word)).slice(0, 20));
    }
    if (slangData?.text) {
      allWords.push(...slangData.text.split(/[\s,.;:()"'{}\[\]]+/).map(w => w.toLowerCase()).filter(w => isValidWord(w, word)).slice(0, 20));
    }

    let uniqueWords = [...new Set(allWords)];

    if (uniqueWords.length > 0) {
      const skip = Math.min(1, uniqueWords.length - 1);
      const pool = uniqueWords.slice(skip, 50);

      const selected = [];
      while (selected.length < count && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
      }
      return selected;
    }
  } catch (error) {
    console.warn('Failed to generate pooled hint:', error);
  }

  return [];
};
