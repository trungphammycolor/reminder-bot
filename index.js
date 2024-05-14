const { WebClient } = require('@slack/web-api');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();

// Your Slack bot token
const token = process.env.SLACK_BOT_TOKEN;
const channelId = 'your-channel-id'; // Replace with your channel ID

const web = new WebClient(token);

// List of users to notify (replace with real Slack user IDs)
const users = [
	'U12345678', // User 1
	'U23456789', // User 2
	'U34567890', // User 3
	// Add more user IDs as needed
];

// Read the index of the last notified user from a file
let currentIndex = 0;
const indexFile = 'currentIndex.txt';
if (fs.existsSync(indexFile)) {
	currentIndex = parseInt(fs.readFileSync(indexFile, 'utf8'), 10);
}

// Function to send the cleaning notification
async function sendCleaningNotification() {
	const userId = users[currentIndex];
	try {
		const res = await web.chat.postMessage({
			channel: userId,
			text: "Reminder: It's your turn to clean the room today!",
		});
		console.log('Message sent to user: ', userId, 'at', res.ts);

		// Update the index and write it to the file
		currentIndex = (currentIndex + 1) % users.length;
		fs.writeFileSync(indexFile, currentIndex.toString());
	} catch (error) {
		console.error('Error sending message: ', error);
	}
}

// Schedule the task to run every day at 5:00 PM
cron.schedule('0 17 * * *', () => {
	console.log('Sending daily cleaning notification');
	sendCleaningNotification();
});

console.log('Slack bot is running...');
