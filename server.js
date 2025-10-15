import express from "express";
import cors from "cors";
import path from "node:path";
import { configDotenv } from "dotenv";
import compression from "compression";
// import helmet from 'helmet';
import logger from "./logs/logger.js";

import httpRoutes from "./routes/httpRoutes.js";

import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", "172.18.0.0/16");

// app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(
	"/static",
	express.static(path.join(process.cwd(), "public"), {
		maxAge: "7d",
		immutable: true,
	}),
);

app.use(
	express.static(path.join(process.cwd(), "dist"), {
		maxAge: "7d",
		immutable: true,
	}),
);

// API routes
app.use("/api/v1", httpRoutes);

// Catch-all: serve index.html for SPA routes
app.use("/", (req, res, next) => {
	if (req.method !== "GET") return next();
	res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

try {
	app.listen(PORT, () => {
		logger.info(
			`[app] ezhost is running on port ${PORT} | Deploy mode: ${
				process.env.NODE_ENV ? process.env.NODE_ENV : "production"
			}`,
		);
	});
} catch (error) {
	logger.error(`[app] Error: ${error.message}`);
	process.exit(1);
}
