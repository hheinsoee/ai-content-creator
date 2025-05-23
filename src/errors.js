class ConfigError extends Error {
    constructor(envVar, description) {
        super(`Missing required environment variable: ${envVar} (${description})`);
        this.name = 'ConfigError';
        this.envVar = envVar;
        this.description = description;
        this.code = 'MISSING_ENV_VAR';
    }
}

module.exports = {
    ConfigError
}; 