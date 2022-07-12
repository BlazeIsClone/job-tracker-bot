const { Permissions } = require("discord.js");
const { exec } = require("child_process");

let printErr, printStdout, printStderr;

let main = async () => {
	exec(
		"npx prisma migrate reset --force && npx prisma migrate dev",
		(error, stdout, stderr) => {
			if (error) {
				error = printErr;
			}
			printStdout = stdout;
			printStderr = stderr;
		}
	);
};

module.exports = {
	name: "clear",
	description: "Reset session cache",
	aliases: ["reset"],
	usage: "[command name]",
	cooldown: 100,

	execute(message) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return message.channel.send({
				content: `⚠️ Only Server Administrators can do that!`,
			});

		main()
			.then(() => {
				message.channel.send({
					content: "```bash\n" + "Database Migration Command Executed" + "```",
				});
			})
			.catch((e) => {
				throw e;
			});
	},
};
