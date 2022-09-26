module.exports = {
  default: true,
  'editor.formatOnSave': true,
  'eslint.autoFixOnSave': true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  'eslint.validate': [
    'javascript',
    'javascriptreact',
    {
      language: 'typescript',
      autoFix: true,
    },
    {
      language: 'typescriptreact',
      autoFix: true,
    },
  ],
};
