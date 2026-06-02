use rusqlite::{Connection, Result as SqlResult, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: i64,
    pub expression: String,
    pub result: String,
    pub timestamp: i64,
}

pub struct Database;

impl Database {
    pub fn init(app_data_dir: PathBuf) -> SqlResult<Connection> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("rapidcalc.db");
        
        log::info!("Initializing database at: {:?}", db_path);
        
        let conn = Connection::open(db_path)?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expression TEXT NOT NULL,
                result TEXT NOT NULL,
                timestamp INTEGER NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC)",
            [],
        )?;

        log::info!("Database initialized successfully");
        Ok(conn)
    }

    pub fn add_entry(conn: &Connection, expression: &str, result: &str) -> SqlResult<HistoryEntry> {
        let timestamp = chrono::Utc::now().timestamp_millis();
        
        conn.execute(
            "INSERT INTO history (expression, result, timestamp) VALUES (?1, ?2, ?3)",
            params![expression, result, timestamp],
        )?;

        let id = conn.last_insert_rowid();
        
        Ok(HistoryEntry {
            id,
            expression: expression.to_string(),
            result: result.to_string(),
            timestamp,
        })
    }

    pub fn get_all(conn: &Connection, limit: Option<i64>) -> SqlResult<Vec<HistoryEntry>> {
        let query = match limit {
            Some(n) => format!("SELECT id, expression, result, timestamp FROM history ORDER BY timestamp DESC LIMIT {}", n),
            None => "SELECT id, expression, result, timestamp FROM history ORDER BY timestamp DESC".to_string(),
        };
        
        let mut stmt = conn.prepare(&query)?;
        
        let entries = stmt.query_map([], |row| {
            Ok(HistoryEntry {
                id: row.get(0)?,
                expression: row.get(1)?,
                result: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

        Ok(entries)
    }

    pub fn search(conn: &Connection, query: &str) -> SqlResult<Vec<HistoryEntry>> {
        let search_pattern = format!("%{}%", query);
        
        let mut stmt = conn.prepare(
            "SELECT id, expression, result, timestamp FROM history 
             WHERE expression LIKE ?1 OR result LIKE ?1 
             ORDER BY timestamp DESC LIMIT 50"
        )?;

        let entries = stmt.query_map([&search_pattern], |row| {
            Ok(HistoryEntry {
                id: row.get(0)?,
                expression: row.get(1)?,
                result: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

        Ok(entries)
    }

    pub fn clear(conn: &Connection) -> SqlResult<()> {
        conn.execute("DELETE FROM history", [])?;
        log::info!("History cleared");
        Ok(())
    }

    pub fn delete_entry(conn: &Connection, id: i64) -> SqlResult<()> {
        conn.execute("DELETE FROM history WHERE id = ?1", [id])?;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn get_count(conn: &Connection) -> SqlResult<i64> {
        conn.query_row("SELECT COUNT(*) FROM history", [], |row| row.get(0))
    }

    pub fn get_statistics(conn: &Connection) -> SqlResult<HistoryStats> {
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM history", [], |row| row.get(0))?;
        
        let avg_length: f64 = conn.query_row(
            "SELECT AVG(LENGTH(expression)) FROM history",
            [],
            |row| row.get(0)
        ).unwrap_or(0.0);

        let (first_ts, last_ts) = conn.query_row(
            "SELECT MIN(timestamp), MAX(timestamp) FROM history",
            [],
            |row| Ok((row.get::<_, Option<i64>>(0)?, row.get::<_, Option<i64>>(1)?))
        ).unwrap_or((None, None));

        let mut stmt = conn.prepare(
            "SELECT expression FROM history ORDER BY timestamp DESC LIMIT 30"
        )?;
        
        let mut operator_counts: std::collections::HashMap<char, usize> = std::collections::HashMap::new();
        
        for expr in stmt.query_map([], |row| row.get::<_, String>(0))?.flatten() {
            for c in expr.chars() {
                if matches!(c, '+' | '-' | '*' | '/' | '^' | '%') {
                    *operator_counts.entry(c).or_insert(0) += 1;
                }
            }
        }

        let most_used = operator_counts
            .into_iter()
            .max_by_key(|(_, count)| *count)
            .map(|(op, _)| op);

        Ok(HistoryStats {
            total_entries: count,
            average_expression_length: avg_length,
            first_calculation: first_ts,
            last_calculation: last_ts,
            most_used_operator: most_used,
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryStats {
    pub total_entries: i64,
    pub average_expression_length: f64,
    pub first_calculation: Option<i64>,
    pub last_calculation: Option<i64>,
    pub most_used_operator: Option<char>,
}

pub struct HistoryState {
    pub conn: Mutex<Connection>,
}

impl HistoryState {
    pub fn new(app_data_dir: PathBuf) -> SqlResult<Self> {
        let conn = Database::init(app_data_dir)?;
        Ok(Self { conn: Mutex::new(conn) })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_database_operations() {
        let temp_dir = env::temp_dir().join("rapidcalc_test");
        let conn = Database::init(temp_dir.clone()).unwrap();

        let entry = Database::add_entry(&conn, "2+2", "4").unwrap();
        assert_eq!(entry.expression, "2+2");
        assert_eq!(entry.result, "4");

        let entries = Database::get_all(&conn, None).unwrap();
        assert!(entries.len() >= 1);

        Database::clear(&conn).unwrap();
        
        std::fs::remove_dir_all(temp_dir).ok();
    }

    #[test]
    fn test_search() {
        let temp_dir = env::temp_dir().join("rapidcalc_test_search");
        let conn = Database::init(temp_dir.clone()).unwrap();

        Database::add_entry(&conn, "5*3", "15").unwrap();
        Database::add_entry(&conn, "10-5", "5").unwrap();

        let results = Database::search(&conn, "5").unwrap();
        assert!(results.len() >= 2);

        std::fs::remove_dir_all(temp_dir).ok();
    }
}