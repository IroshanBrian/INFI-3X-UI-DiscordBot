import pino from "pino";

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,       // Enables colored output
            levelFirst: true,     // Show log level first
            translateTime: "HH:MM:ss Z",  // Format timestamps
            ignore: "pid,hostname", // Remove unnecessary info
        },
    },
});

export default logger;
