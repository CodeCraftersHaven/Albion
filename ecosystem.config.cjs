module.exports = {
  apps: [
    {
      name: 'Albion',
      script: 'dist/index.js',
      watch: ['dist'],
      ignore_watch: ['node_modules', '.sern', 'src', 'assets', 'prisma']
    }
  ]
};
