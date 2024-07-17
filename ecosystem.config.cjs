module.exports = {
  apps: [
    {
      name: 'Albion Guide',
      script: 'dist/index.js',
      watch: ['dist'],
      ignore_watch: ['node_modules', '.sern', 'src', 'prisma']
    }
  ]
};
