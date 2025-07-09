import axios, { AxiosError } from 'axios';
import { handleAxiosError } from '../services/utils';

interface configType {
  url: string;
  method: string;
  data?: unknown;
  withCredentials: boolean;
  headers: {
    Accept?: string;
    'Content-Type'?: string;
    Authorization?: string;
  };
  transformResponse?: (data: unknown) => unknown;
}

async function baseRequest(path: string, method: string, body: unknown, token?: string) {
  const config: configType = {
    url: `${process.env.ROBOKACHE}/api/${path}`,
    method,
    data: body,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (token) {
    config.headers.Authorization = token;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return handleAxiosError(error as AxiosError);
  }
}

const baseRoutes = {
  async getDocumentsNoParent(token: string | undefined) {
    return baseRequest('document?has_parent=false', 'GET', null, token);
  },

  async getDocument(doc_id: string, token: string | undefined) {
    return baseRequest(`document/${doc_id}`, 'GET', null, token);
  },

  async getChildrenByDocument(doc_id: string, token: string | undefined) {
    return baseRequest(`document/${doc_id}/children`, 'GET', null, token);
  },

  async getDocumentData(doc_id: string, token: string | undefined) {
    const config: configType = {
      url: `${process.env.ROBOKACHE}/api/document/${doc_id}/data`,
      method: 'GET',
      withCredentials: true,
      headers: {},
      transformResponse: (res: unknown) => res,
    };
    if (token) {
      config.headers.Authorization = token;
    }
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error as AxiosError);
    }
  },

  async setDocumentData(doc_id: string, newData: unknown, token: string | undefined) {
    const config: configType = {
      url: `${process.env.ROBOKACHE}/api/document/${doc_id}/data`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {},
    };
    config.headers.Authorization = token;
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error as AxiosError);
    }
  },

  async createDocument(doc: unknown, token: string | undefined) {
    return baseRequest('document', 'POST', doc, token);
  },

  async updateDocument(doc: { id: string; [key: string]: unknown }, token: string | undefined) {
    return baseRequest(`document/${doc.id}`, 'PUT', doc, token);
  },

  async deleteDocument(doc_id: string, token: string | undefined) {
    return baseRequest(`document/${doc_id}`, 'DELETE', undefined, token);
  },
};

export const routes = {
  getQuestion: baseRoutes.getDocument,
  getQuestionData: baseRoutes.getDocumentData,
  setQuestionData: baseRoutes.setDocumentData,
  createQuestion: baseRoutes.createDocument,
  updateQuestion: baseRoutes.updateDocument,
  deleteQuestion: baseRoutes.deleteDocument,

  getAnswer: baseRoutes.getDocument,
  getAnswerData: baseRoutes.getDocumentData,
  setAnswerData: baseRoutes.setDocumentData,
  createAnswer: baseRoutes.createDocument,
  updateAnswer: baseRoutes.updateDocument,
  deleteAnswer: baseRoutes.deleteDocument,

  getQuestions: baseRoutes.getDocumentsNoParent,
  getAnswersByQuestion: baseRoutes.getChildrenByDocument,
};
