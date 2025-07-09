import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import { db_p, sql } from '../db_utils';

dotenv.config();

const db = new sqlite3.Database(process.env.EXPLORE_DB!);

interface DrugDiseasePair {
  drug_name: string;
  drug_id: string;
  disease_name: string;
  disease_id: string;
  score: number;
  known: number;
}

interface GetDrugDiseasePairsParams {
  sort?: {
    drug_name?: 'asc' | 'desc';
    disease_name?: 'asc' | 'desc';
    score?: 'asc' | 'desc';
    known?: 'asc' | 'desc';
  };
  filters?: {
    drug_name?: string;
    drug_id?: string;
    disease_name?: string;
    disease_id?: string;
  };
  pagination: {
    limit: number;
    offset: number;
  };
}

interface GetDrugDiseasePairsResult {
  rows: DrugDiseasePair[];
  num_of_results: number;
  limit: number;
  offset: number;
}

/**
 * @param {{
 *  sort?: {
 *    drug_name?: "asc" | "desc",
 *    disease_name?: "asc" | "desc",
 *    score?: "asc" | "desc",
 *    known?: "asc" | "desc",
 *  }
 *  filters?: {
 *    drug_name?: string,
 *    drug_id?: string,
 *    disease_name?: string,
 *    disease_id?: string,
 *  },
 *  pagination: {
 *    limit: number,
 *    offset: number,
 *  }
 * }} params
 * @returns {Promise<{
 *  rows: {
 *    drug_name: string,
 *    drug_id: string,
 *    disease_name: string,
 *    disease_id: string,
 *    score: number,
 *    known: number
 *  }[],
 *  num_of_results: number,
 *  limit: number,
 *  offset: number,
 * }>}
 */
export async function getDrugDiseasePairs({
  sort,
  filters,
  pagination,
}: GetDrugDiseasePairsParams): Promise<GetDrugDiseasePairsResult> {
  const { whereClause, whereParams } = buildWhereClause(filters);
  const orderByClause = buildOrderByClause(sort);
  const { paginationClause, paginationParams } = buildPaginationClause(
    pagination.limit,
    pagination.offset
  );

  const params = [...whereParams, ...paginationParams];

  const query = sql`\
    SELECT * FROM drug_disease_pairs${whereClause}${orderByClause}${paginationClause}\
  `;
  const countQuery = sql`\
    SELECT COUNT(*) AS total FROM drug_disease_pairs${whereClause}\
  `;

  return new Promise((resolve, reject) => {
    db.parallelize(() => {
      Promise.all([
        db_p.all(db, query, params),
        db_p.get<{ total: number }>(db, countQuery, whereParams),
      ])
        .then(([rows, countResult]) => {
          const total = countResult?.total ?? 0;
          resolve({
            rows: rows as DrugDiseasePair[],
            num_of_results: total,
            ...pagination,
          });
        })
        .catch(reject);
    });
  });
}

function buildWhereClause(filters?: GetDrugDiseasePairsParams['filters']): {
  whereClause: string;
  whereParams: string[];
} {
  const whereClauses: string[] = [];
  const params: string[] = [];

  if (filters) {
    if (filters.drug_name) {
      whereClauses.push('drug_name LIKE ?');
      params.push(`%${filters.drug_name}%`);
    }
    if (filters.drug_id) {
      whereClauses.push('drug_id LIKE ?');
      params.push(`%${filters.drug_id}%`);
    }
    if (filters.disease_name) {
      whereClauses.push('disease_name LIKE ?');
      params.push(`%${filters.disease_name}%`);
    }
    if (filters.disease_id) {
      whereClauses.push('disease_id LIKE ?');
      params.push(`%${filters.disease_id}%`);
    }
  }

  const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
  return { whereClause, whereParams: params };
}

function buildOrderByClause(sort?: GetDrugDiseasePairsParams['sort']): string {
  let orderByClause = '';
  if (sort) {
    const orderClauses: string[] = [];
    for (const [column, direction] of Object.entries(sort)) {
      if (
        ['drug_name', 'disease_name', 'score', 'known'].includes(column) &&
        ['asc', 'desc'].includes(direction)
      ) {
        orderClauses.push(`${column} ${direction.toUpperCase()}`);
      }
    }
    if (orderClauses.length > 0) {
      orderByClause += ` ORDER BY ${orderClauses.join(', ')}`;
    }
  }
  return orderByClause;
}

function buildPaginationClause(
  limit: number,
  offset: number
): { paginationClause: string; paginationParams: [number, number] } {
  return {
    paginationClause: ' LIMIT ? OFFSET ?',
    paginationParams: [limit, offset],
  };
}
