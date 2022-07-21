CREATE TABLE IF NOT EXISTS accounting (
    start_at TIMESTAMPTZ NOT NULL,
    user_mac macaddr8 NOT NULL, 
    hotspot TEXT NOT NULL, 
    session_id TEXT NOT NULL, 
    end_at TIMESTAMPTZ NULL, 
    user_ip inet NULL, 
    input_bytes BIGINT NULL, 
    output_bytes BIGINT NULL, 
    input_packets BIGINT NULL, 
    output_packets BIGINT NULL, 
    session_time INT NULL, 
    nas TEXT NULL,
    is_new BOOLEAN NOT NULL,
    ip inet NULL
);

SELECT create_hypertable('accounting', 'start_at');

CREATE INDEX ix_accounting ON accounting (user_mac, hotspot, start_at DESC);

SELECT  date_trunc('day', start_at) as day,
        count(*) as connections,
        sum(output_bytes) as traffic_total,
        avg(output_bytes) as average_traffic,
        avg(session_time) as average_session_time,
        count(DISTINCT user_mac) as guests_per_day, 
        count(*) FILTER (WHERE acc.is_new = TRUE) as new_guests,
        count(*) - count(DISTINCT user_mac) as reconnections
        FROM accounting acc
        WHERE start_at > now() - INTERVAL '3 month' AND user_mac IN () AND hotspot = IN ()
        GROUP BY day
        ORDER BY day;