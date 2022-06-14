const { PrismaClient } = require("@prisma/client");
const { owner } = require("../../config.json");

const prisma = new PrismaClient();

async function main(message, args) {
	let userID = message.author.id;

	await prisma.session.deleteMany({});
}

module.exports = {
	name: "clear",

	execute(message, args) {
		main(message, args)
			.then(() => {
				message.channel.send({
					content: `Cleared Cache`,
				});
			})
			.catch((e) => {
				throw e;
			})
			.finally(async () => {
				await prisma.$disconnect();
			});
	},
};
