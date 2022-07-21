require("dotenv").config();
const dayjs = require("dayjs");
const sql = require("./postgres");

async function test() {
	// await client.connect();

	try {
		const query = `SELECT date_trunc('day', start_at) as day,
		count(*) as connections,
		sum(output_bytes) as traffic_total,
		avg(output_bytes) as average_traffic,
		avg(session_time) as average_session_time,
		count(DISTINCT user_mac) as guests_per_day,
		count(*) FILTER (WHERE acc.is_new = TRUE) as new_guests,
		count(*) - count(DISTINCT user_mac) as reconnections
		FROM accounting acc
		WHERE start_at > now() - INTERVAL '3 month'
		GROUP BY day
		ORDER BY day;`;

		const f =
			"SELECT count(*) as unique_guests FROM (SELECT DISTINCT ON (user_mac) user_mac FROM accounting WHERE start_at > now() - INTERVAL '1 year') as unique_users";

		const periodParams = {
			year: {
				divideBy: "month",
				interval: dayjs().subtract(1, "year").toDate(),
			},
		};

		const start = Date.now();
		// const results =
		// 	await sql`SELECT count(*) as unique_guests FROM (SELECT DISTINCT ON (user_mac) user_mac FROM accounting WHERE start_at > now() - INTERVAL '1 year') as unique_users`;
		const results2 =
			await sql`SELECT * FROM day_accounting WHERE day >= now() - INTERVAL '1 year' AND hotspot = '628f56291f9993ac72579d8f' ORDER BY day DESC`;

		let result3 = results2
			.reduce((acc, cum) => {
				const idx = acc.findIndex((session) => session.day === cum.day);

				if (idx === -1) {
					acc.push({
						day: cum.day,
						connections: parseInt(cum.connections),
						traffic_total: parseInt(cum.traffic_total),
						average_traffic: [parseInt(cum.average_traffic)],
						average_session_time: [parseInt(cum.average_session_time)],
						guests_per_day: parseInt(cum.guests_per_day),
						new_guests: parseInt(cum.new_guests),
						reconnections: parseInt(cum.reconnections),
					});
				} else {
					acc[idx].connections += parseInt(cum.connections);
					acc[idx].traffic_total += parseInt(cum.traffic_total);
					acc[idx].average_traffic.push(parseInt(cum.average_traffic)),
						acc[idx].average_session_time.push(
							parseInt(cum.average_session_time)
						);
					acc[idx].guests_per_day += parseInt(cum.guests_per_day);
					acc[idx].new_guests += parseInt(cum.new_guests);
					acc[idx].reconnections += parseInt(cum.reconnections);
				}

				return acc;
			}, [])
			.map((session) => {
				session.average_session_time =
					session.average_session_time.reduce((acc, cum) => acc + cum, 0) /
					session.average_session_time.length;

				session.average_traffic =
					session.average_traffic.reduce((acc, cum) => acc + cum, 0) /
					session.average_traffic.length;

				return session;
			});
		const end = Date.now();

		console.log(`${end - start}ms time`);
		// console.log(`${results.length} rows returned`);
		console.log(`${results2.length} rows returned from second query`);
		// console.log(results[0]);
		console.log(result3[50]);
		console.log(result3.length);
	} catch (error) {
		console.log(error);
	}
}

test();

function normalize(arr) {
	return arr
		.reduce((acc, cum) => {
			const idx = acc.findIndex((session) => session.day === cum.day);

			if (idx === -1) {
				acc.push({
					day: cum.day,
					connections: parseInt(cum.connections),
					traffic_total: parseInt(cum.traffic_total),
					average_traffic: [parseInt(cum.average_traffic)],
					average_session_time: [parseInt(cum.average_session_time)],
					guests_per_day: parseInt(cum.guests_per_day),
					new_guests: parseInt(cum.new_guests),
					reconnections: parseInt(cum.reconnections),
				});
			} else {
				acc[idx].connections += parseInt(cum.connections);
				acc[idx].traffic_total += parseInt(cum.traffic_total);
				acc[idx].average_traffic.push(parseInt(cum.average_traffic)),
					acc[idx].average_session_time.push(
						parseInt(cum.average_session_time)
					);
				acc[idx].guests_per_day += parseInt(cum.guests_per_day);
				acc[idx].new_guests += parseInt(cum.new_guests);
				acc[idx].reconnections += parseInt(cum.reconnections);
			}

			return acc;
		}, [])
		.map((session) => {
			session.average_session_time =
				session.average_session_time.reduce((acc, cum) => acc + cum, 0) /
				session.average_session_time.length;

			session.average_traffic =
				session.average_traffic.reduce((acc, cum) => acc + cum, 0) /
				session.average_traffic.length;

			return session;
		});
}
