import autoprefixer from 'autoprefixer';
import prepend from 'postcss-prefix-selector';

/**
 * Custom PostCSS plugin: duplicate @media (prefers-color-scheme: dark) rules
 * - Original rules get ':not(.theme-light)' appended to selectors
 * - Cloned rules get '.theme-dark' appended (so dark mode can be forced via class)
 */
function duplicateDarkMode() {
  return {
    postcssPlugin: 'duplicate-from-media',
    Once(root) {
      root.walkAtRules('media', atRule => {
        if (atRule.params !== '(prefers-color-scheme: dark)') return;
        atRule.walkRules(rule => {
          const cloned = rule.clone();
          rule.selector += ':not(.theme-light)';
          cloned.selector += '.theme-dark';
          atRule.parent.insertBefore(atRule, cloned);
        });
      });
    }
  };
}
duplicateDarkMode.postcss = true;

export default {
  plugins: [
    autoprefixer,
    duplicateDarkMode,
    prepend({
      prefix: '.ideditor',
      exclude: [/^\.ideditor(\[.*?\])*/],
      transform: function(prefix, selector, prefixedSelector, filePath) {
        // Do not prefix styles from node_modules (e.g. Element Plus)
        if (filePath && filePath.match(/node_modules/)) {
          return selector;
        }
        return prefixedSelector;
      }
    })
  ]
};
