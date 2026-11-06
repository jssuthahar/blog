/**
 * The OpenAI tokenizers, loaded once per page and shared by the calculator and
 * the course. gpt-tokenizer runs entirely in the browser: nothing is sent
 * anywhere to count a token.
 *
 * o200k_base is fetched first because every count on the page uses it;
 * cl100k_base is only needed for one comparison row, so it waits until asked.
 */
let o200k = null;
let cl100k = null;

export function loadO200k() {
  o200k ??= import('gpt-tokenizer/encoding/o200k_base')
    .then((m) => (window.GPTTokenizer_o200k_base = m))
    .catch(() => null);
  return o200k;
}

export function loadCl100k() {
  cl100k ??= import('gpt-tokenizer/encoding/cl100k_base')
    .then((m) => (window.GPTTokenizer_cl100k_base = m))
    .catch(() => null);
  return cl100k;
}

/** Kept for the course script, which reads the encoders from window. */
export const loadTokenizers = () => loadO200k();
