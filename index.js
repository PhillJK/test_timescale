require("dotenv").config();
const dayjs = require("dayjs");
const client = require("./postgres");

async function main() {
	const session_time = 60;
	const ip = "192.168.82.243";
	const user_ip = "192.209.82.32";
	const nas = "officeMain";
	const user = "3C:F7:A4:A9:7E:9B";
	const user2 = "A2:25:E0:BB:8A:06";
	const hotspot = "628f56291f9993ac72579d8f";

	try {
		const startOfTheYear = dayjs().startOf("year").toDate().getTime();
		const currentDay = Date.now();
		const milliseconds = currentDay - startOfTheYear;
		const hours = Math.ceil(milliseconds / 3_600_000);

		await client.connect();

		for (let hour = 0; hour < hours; hour++) {
			for (let userIdx = 0; userIdx < 2; userIdx++) {
				for (let i = 0; i < 186; i++) {
					const start_at = dayjs().startOf("year").add(hour, "hour").toDate();
					const end_at = dayjs(start_at).add(1, "hour").toDate();
					const input_packets = 500 + Math.floor(Math.random() * 1500);
					const output_packets = 500 + Math.floor(Math.random() * 1500);
					const input_bytes = 100_000 + Math.floor(Math.random() * 900_000);
					const output_bytes = 100_000 + Math.floor(Math.random() * 900_000);

					const letters = ["a", "b", "c", "d", "e", "f"];
					const random_number = Math.floor(Math.random() * 1_000_000_000);
					const random_letter =
						letters[Math.floor(Math.random() * letters.length)];

					const session_id = `${random_number}${random_letter}`;

					const query = `INSERT INTO accounting (user_mac,
						hotspot,
						session_id,
						end_at,
						input_bytes,
						input_packets,
						ip,
						nas,
						output_packets,
						output_bytes,
						session_time,
						start_at,
						user_ip,
						is_new) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;

					const params = [
						userIdx === 0 ? user : user2,
						hotspot,
						session_id,
						end_at,
						input_bytes,
						input_packets,
						ip,
						nas,
						output_packets,
						output_bytes,
						session_time,
						start_at,
						user_ip,
						hour > 0 ? false : true,
					];

					await client.query(query, params);
				}
			}
		}
	} catch (error) {
		console.log(error);
	} finally {
		await client.end();
	}
}

main();
