/**
 * One identifier per build, shared by the page meta tag and /version.json.
 *
 * Evaluated once when the build runs, so every page in a deploy carries the
 * same value and the next deploy carries a different one. That difference is
 * what lets an installed app notice it is running yesterday's code.
 */
export const BUILD_ID = new Date().toISOString();
