module.exports = {
  apps: [
    {
      name: 'AlbionGuide',
      script: 'dist/index.js',
      watch: ['./dist'],
      ignore_watch: ['node_modules', '.sern', 'src', 'prisma']
    }
  ]
};
