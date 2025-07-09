import type sqlite3 from "sqlite3";

type SQL = string;
type Params = unknown[] | { [key: string]: unknown } | undefined;

const run = async (db: sqlite3.Database, sql: SQL, params?: Params): Promise<void> =>
  new Promise((res, rej) => {
    db.run(sql, params, (err: Error | null) => {
      if (err) rej(err);
      else res();
    });
  });

const get = async <T = unknown>(db: sqlite3.Database, sql: SQL, params?: Params): Promise<T | undefined> =>
  new Promise((res, rej) => {
    db.get(sql, params, (err: Error | null, row: T) => {
      if (err) rej(err);
      else res(row);
    });
  });

const all = async <T = unknown>(db: sqlite3.Database, sql: SQL, params?: Params): Promise<T[]> =>
  new Promise((res, rej) => {
    db.all(sql, params, (err: Error | null, rows: T[]) => {
      if (err) rej(err);
      else res(rows);
    });
  });

/**
 * Same as normal template literal but 'sql' tag allows syntax highlighting in editor
 */
const sql = (strings: TemplateStringsArray, ...args: unknown[]): string => strings.reduce((str, curr, i) => str + curr + (args[i] ?? ""), "");

export const db_p = {
  run,
  get,
  all,
};

export { sql };
