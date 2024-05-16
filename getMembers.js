const { WebClient } = require('@slack/web-api');
const fs = require('fs');
require('dotenv').config();

// Your Slack bot token from environment variables
const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID; // Replace with your actual channel ID

const web = new WebClient(token);

// Usernames to exclude
const excludedUsernames = [
	'simplepoll',
	'chivp',
	'tani',
	'reminder',
	'hieu.pham',
];

async function getChannelMembers(channelId) {
	try {
		// Fetch channel members
		const result = await web.conversations.members({ channel: channelId });
		const memberIds = result.members;

		// Fetch user info for each member and filter out excluded usernames
		const filteredMembers = [];

		let no = 0;
		for (const memberId of memberIds) {
			const userInfo = await web.users.info({ user: memberId });
			if (!excludedUsernames.includes(userInfo.user.name)) {
				const { id, name } = userInfo.user;
				filteredMembers.push({ no: no++, id, name });
			}
		}

		console.log(
			`Filtered Member IDs in channel ${channelId}:`,
			filteredMembers
		);

		// Save member IDs to a JSON file
		const users = { users: filteredMembers };
		fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
		console.log('Filtered Member IDs saved to users.json');
	} catch (error) {
		console.error('Error fetching channel members: ', error);
	}
}

getChannelMembers(channelId);
