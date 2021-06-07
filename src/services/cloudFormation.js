const AWS = require("aws-sdk");
const logger = require("../utils/logger");

const getStaleStacks = async ({ region, driftDetectionMinAgeHours, maxCount, nextToken }) => {
	const cloudFormation = new AWS.CloudFormation({ region });
	const { Stacks: stacks, NextToken: newNextToken } = await cloudFormation
		.describeStacks({
			NextToken: nextToken
		})
		.promise();
	const staleStacks = stacks.filter(stack =>
		isStackDriftDetectionStale({ stack, driftDetectionMinAgeHours })
	);
	if (staleStacks.length >= maxCount || !newNextToken) {
		return staleStacks.slice(0, maxCount);
	}
	const moreStaleStacks = await getStaleStacks({
		region,
		driftDetectionMinAgeHours,
		maxCount: maxCount - staleStacks.length,
		nextToken: newNextToken
	});
	return staleStacks.concat(moreStaleStacks);
};

const isStackDriftDetectionStale = ({ stack, driftDetectionMinAgeHours }) => {
	const isNotChecked =
		!stack.DriftInformation || stack.DriftInformation.StackDriftStatus === "NOT_CHECKED";
	if (isNotChecked) {
		return true;
	}
	const lastCheckTimestamp = stack.DriftInformation?.LastCheckTimestamp;
	if (!lastCheckTimestamp) {
		return true;
	}
	const checkAgeMilliSeconds =
		Date.now() - new Date(stack.DriftInformation.LastCheckTimestamp).getTime();
	const checkAgeHours = checkAgeMilliSeconds / 1000 / 3600;
	return checkAgeHours > driftDetectionMinAgeHours;
};

const sendDetectDrift = async ({ region, stackIds }) => {
	const cloudFormation = new AWS.CloudFormation({ region });
	for (const stackId of stackIds) {
		try {
			logger.info(`${region}: Triggering drift detection for stack: ${stackId}`);
			// const response = { StackDriftDetectionId: "test" };
			const response = await cloudFormation.detectStackDrift({ StackName: stackId }).promise();
			logger.info(
				`${region}: Drift detection: ${response.StackDriftDetectionId} started for stack: ${stackId}`
			);
		} catch (error) {
			logger.warn(`${region}: Skipping failed stack: ${stackId}`, error);
		}
	}
};

module.exports = {
	getStaleStacks,
	sendDetectDrift
};
