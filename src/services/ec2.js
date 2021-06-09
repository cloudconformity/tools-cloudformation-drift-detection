const AWS = require("aws-sdk");
const getRegions = async selectedRegions => {
	if (selectedRegions === "all" || !selectedRegions) {
		const ec2 = new AWS.EC2();
		const response = await ec2.describeRegions().promise();
		return response.Regions.map(region => region.RegionName);
	}
	return selectedRegions.split(",").map(region => region.trim());
};

module.exports = {
	getRegions
};
