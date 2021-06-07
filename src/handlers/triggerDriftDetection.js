const { getStaleStacks, sendDetectDrift } = require("../services/cloudFormation");
const { getRegions } = require("../services/ec2");
const logger = require("../utils/logger");

const triggerDriftDetection = async event => {
	logger.info("Received event:", event);
	const regions = await getRegions(event.regions);
	const { driftDetectionMinAgeHours, excludedStackIds = "", batchSize } = event;
	logger.info("Will detect stale drifted in regions:", regions);

	await Promise.all(
		regions.map(async region => {
			try {
				const staleStacks = await getStaleStacks({
					region,
					driftDetectionMinAgeHours: Number(driftDetectionMinAgeHours),
					excludedStackIds: excludedStackIds
						.split(",")
						.map(excludedStackId => excludedStackId.trim())
						.filter(excludedStackId => excludedStackId),
					maxCount: Number(batchSize)
				});
				logger.info(`${region}: Found ${staleStacks.length} stacks with stale drift detection`);
				await sendDetectDrift({ region, stackIds: staleStacks.map(stack => stack.StackId) });
				logger.info(`${region}: Drift detection triggered for ${staleStacks.length} stacks`);
			} catch (error) {
				logger.warn(`${region}: Skipping failed region`, error);
			}
		})
	);
	logger.info("CloudFormation stacks with stale drift detection have been updated successfully");
};

exports.handler = triggerDriftDetection;
