module.exports = {
  apps: [
    {
      name: 'BE_BABYSHOP',
      script: 'dist/main.js',
      watch: false,
      instances: 1,
      exec_mode: "cluster",
      env: {
      }
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};


