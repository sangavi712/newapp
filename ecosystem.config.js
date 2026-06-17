module.exports = {
  apps: [
    {
      name: 'buddylearn-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'buddylearn-backend',
      cwd: './backend',
      script: 'gunicorn',
      args: '-c gunicorn.conf.py run:app',
      interpreter: './venv/bin/python',
      env: {
        FLASK_ENV: 'production',
        PORT: 5000
      },
      instances: 1, // Gunicorn manages its own workers
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
