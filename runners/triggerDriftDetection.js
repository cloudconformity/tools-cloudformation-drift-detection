process.env.AWS_REGION = "ap-southeast-2";

const triggerDriftDetection = require("../src/handlers/triggerDriftDetection");
const event = require("../events/event-cloudwatch-event.json");
const logger = require("../src/utils/logger");

(async () => {
	try {
		const result = await triggerDriftDetection.handler(event);
		logger.info("triggerDriftDetection handler returned successfully", result);
	} catch (error) {
		logger.error("Failed to run triggerDriftDetection handler", error);
	}
})();
