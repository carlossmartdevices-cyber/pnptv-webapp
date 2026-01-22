module.exports = {
  apps: [
    // Frontend - using simple Node.js static server
    {
      name: 'pnptv-frontend',
      script: './frontend-server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'dist', '.git'],
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      exec_mode: 'fork'
    },
    
    // Backend - Node.js/Express server (using tsx for TypeScript support)
    {
      name: 'pnptv-backend',
      script: 'node_modules/.bin/tsx',
      args: ['src/index.ts'],
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'dist', '.git'],
      max_memory_restart: '512M',
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      exec_mode: 'fork'
    }
  ],
  
  // Deployment settings for Hostinger
  deploy: {
    production: {
      user: 'ssh_user',
      host: 'your.hostinger.server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/home/pnptv',
      'post-deploy': 'npm install && npm run build:frontend && pm2 start ecosystem.config.js --env production && pm2 save'
    }
  }
};