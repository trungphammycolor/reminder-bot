const fs = require('fs');
const dotenv = require('dotenv');
const { WebClient } = require('@slack/web-api');
const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dotenv.config();

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID; // Replace with your actual channel ID

const web = new WebClient(token);

function celebrate() {
	const rawdata = fs.readFileSync('usersWithBirthday.json');
	const users = JSON.parse(rawdata).users;

	const today = dayjs().tz('Asia/Ho_Chi_Minh').startOf('day');

	users.forEach(async (user) => {
		let birthday = dayjs(user.dateOfBirth).tz('Asia/Ho_Chi_Minh');
		let compareBirthday = birthday.year(today.year());

		if (today.isSame(compareBirthday, 'day')) {
			const age = today.year() - birthday.year();
			console.log(`${user.name} is ${age} years old.`);

			try {
				await web.chat.postMessage({
					channel: channelId,
					text: `Chúc mừng sinh nhật <@${user.id}|${user.name}> tròn ${age} tuổi.\nChúc bạn luôn mạnh khỏe yêu đời và hạnh phúc! :birthday:`,
				});
				console.log(`Birthday message sent to ${user.name}`);
			} catch (error) {
				console.error(error);
			}
		}
	});
}

celebrate();

// Schedule the task to run at 8:30 AM every day
cron.schedule(
	'30 8 * * *',
	() => {
		celebrate();
	},

	{
		scheduled: true,
		timezone: 'Asia/Ho_Chi_Minh',
	}
);
