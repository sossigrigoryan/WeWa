const users = new Map();

/**
 * Gets user data by ID.
 * @param {number} userId
 * @returns {object | undefined}
 */
export function getUser(userId) {
  return users.get(userId);
}

/**
 * Sets user language.
 * @param {number} userId
 * @param {string} language
 */
export function setUserLanguage(userId, language) {
  const user = users.get(userId) || {};
  user.language = language;
  users.set(userId, user);
}

/**
 * Gets user language.
 * @param {number} userId
 * @returns {string | undefined}
 */
export function getUserLanguage(userId) {
  const user = users.get(userId);
  return user?.language;
}
