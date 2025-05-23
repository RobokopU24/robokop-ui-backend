import { SavedQueryModel, ISavedQuery } from '../models/SavedQuery';
import mongoose from 'mongoose';

export async function createSavedQuery(
  userId: string,
  name: string | undefined,
  query: any
): Promise<ISavedQuery> {
  const doc = new SavedQueryModel({
    userId,
    name,
    query,
  });
  return doc.save();
}

export async function getSavedQueries(userId: string): Promise<ISavedQuery[]> {
  return SavedQueryModel.find({ userId }).sort({ createdAt: -1 }).exec();
}

export async function findQueriesByPredicate(predicate: string): Promise<ISavedQuery[]> {
  return SavedQueryModel.aggregate([
    {
      $addFields: {
        edgesArray: {
          $objectToArray: '$query.message.query_graph.edges',
        },
      },
    },
    { $unwind: '$edgesArray' },
    {
      $match: {
        'edgesArray.v.predicates': predicate,
      },
    },
    {
      $project: {
        edgesArray: 0,
      },
    },
  ]);
}
