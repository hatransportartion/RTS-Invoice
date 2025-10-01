// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "RTS_Invoice",
      script: "index.js",
      watch: true,
      ignore_watch: [
        "node_modules",
        "uploads",
        "uploaded_loads.csv"
      ],
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};