const { WebClient } = require('@slack/web-api');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID; // Replace with your actual channel ID

const web = new WebClient(token);

// Load member info from the JSON file
const members = require('./users.json').users;

// Read the index of the last notified user from a file
let currentIndex = 0;
const indexFile = 'currentIndex.txt';

if (fs.existsSync(indexFile)) {
	currentIndex = parseInt(fs.readFileSync(indexFile, 'utf8'), 10);
}

// Function to send the cleaning notification
async function sendCleaningNotification() {
	console.log();
	const { id, name } = members[currentIndex];
	try {
		const res = await web.chat.postMessage({
			channel: channelId,
			text: `<@${id}|${name}>, :bell: keng keng keng đổ rác thôiiiiii.`,
		});
		console.log(
			'Message sent to channel: ',
			channelId,
			'with user mention',
			id,
			'at',
			res.ts
		);

		// Update the index and write it to the file
		currentIndex = (currentIndex + 1) % members.length;
		fs.writeFileSync(indexFile, currentIndex.toString());
	} catch (error) {
		console.error('Error sending message: ', error);
	}
}

// Schedule the task to run every day at 5:00 PM, excluding Saturdays and Sundays
cron.schedule('0 17 * * 1-5', () => {
	console.log('Sending daily cleaning notification');
	sendCleaningNotification();
});

console.log('Slack bot is running...');
