import axios, { AxiosError } from 'axios';
import { Request, Response, RequestHandler } from 'express';
import { handleAxiosError } from '../services/utils';
import yaml from 'js-yaml';
import { routes } from '../services/robokacheServices';
import apiServices from '../services/apiServices';
import { getDrugDiseasePairs } from '../explore/query/drug-disease';

export const nodeNorm: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.post(
      `${process.env.NODE_NORMALIZER}/get_normalized_nodes`,
      req.body
    );
    res.send(response.data);
  } catch (error) {
    if (axios.isCancel(error)) {
      res.send({});
    }
    res.send(handleAxiosError(error as AxiosError));
  }
};

export const nameResolver: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const config = {
    headers: {
      'Content-Type': 'text/plain',
    },
    params: {
      string: req.query.string,
      biolink_type: req.query.type,
      limit: req.query.limit,
    },
  };
  try {
    const response = await axios.post(`${process.env.NAME_RESOLVER}/lookup`, {}, config);
    res.send(response.data);
  } catch (error) {
    res.send(handleAxiosError(error as AxiosError));
  }
};

export const biolink: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  let response;
  try {
    response = await axios.get(process.env.BIOLINK!);
  } catch (error) {
    console.error('Error fetching Biolink model:', error);
    res.status(500).send(handleAxiosError(error as AxiosError));
  }

  // Parse YAML into JSON
  try {
    const biolink = yaml.load(response!.data); // js-yaml v4+ uses `.load`
    res.json(biolink);
  } catch (error) {
    console.error('Error parsing YAML:', error);
    res.status(500).send({
      status: 'error',
      message: 'Failed to load Biolink model specification: could not parse YAML',
    });
  }
};

export const getDocQuestion: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.getQuestion(req.params.doc_id, req.headers.authorization);
  res.send(result);
};

export const createDocQuestion: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.createQuestion(req.body, req.headers.authorization);
  res.send(result);
};

export const updateDocQuestion: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.updateQuestion(req.body, req.headers.authorization);
  res.send(result);
};

export const deleteDocQuestion: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.deleteQuestion(req.params.doc_id, req.headers.authorization);
  res.send(result);
};

export const getDocQuestionData: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.getQuestionData(req.params.doc_id, req.headers.authorization);
  res.send(result);
};

export const setDocQuestionData: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.setQuestionData(
    req.params.doc_id,
    req.body,
    req.headers.authorization
  );
  res.send(result);
};

export const getDocQuestions: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.getQuestions(req.headers.authorization);
  res.send(result);
};

export const createDocAnswer: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.createAnswer(req.body, req.headers.authorization);
  res.send(result);
};

export const getDocAnswer: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const result = await routes.getAnswer(req.params.doc_id, req.headers.authorization);
  res.send(result);
};

export const updateDocAnswer: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.updateAnswer(req.body, req.headers.authorization);
  res.send(result);
};

export const deleteDocAnswer: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.deleteAnswer(req.params.doc_id, req.headers.authorization);
  res.send(result);
};

export const getDocAnswerData: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.getAnswerData(req.params.doc_id, req.headers.authorization);
  res.send(result);
};

export const setDocAnswerData: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.setAnswerData(req.params.doc_id, req.body, req.headers.authorization);
  res.send(result);
};

export const getDocAnswersByQuestion: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await routes.getAnswersByQuestion(
    req.params.question_id,
    req.headers.authorization
  );
  res.send(result);
};

export const quickAnswer: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { ara } = req.query;
  const ara_url = apiServices[ara as keyof typeof apiServices];
  const config = {
    method: 'POST',
    url: ara_url,
    data: req.body,
    transformResponse: [(data: unknown) => data],
  };

  try {
    const response = await axios(config);

    try {
      const answer = JSON.parse(response.data);
      res.send(answer);
    } catch (error) {
      console.error(`Error parsing JSON response from ${ara}:`, error);
      res.send({
        status: 'error',
        message: `Received unparseable JSON response from ${ara}`,
      });
    }
  } catch (err) {
    console.error(`Error from ${ara_url}:`, err);
    res.send({
      status: 'error',
      message: `Error from ${ara_url}`,
    });
  }
};

export const drugDiseases: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { sort, filters, pagination } = req.body;

  if (!pagination || !Number.isInteger(pagination.offset) || !Number.isInteger(pagination.limit))
    res.status(400).json({ error: 'Missing pagination' });

  if (pagination.limit < 1 || pagination.offset < 0)
    res.status(400).json({ error: 'Invalid limit or offset value' });

  const limit = Math.min(pagination.limit, 500);
  const { offset } = pagination;

  try {
    const results = await getDrugDiseasePairs({ sort, filters, pagination: { limit, offset } });
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in explore page query:', error, req.body);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const postAnswer: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { questionId, ara } = req.query as { questionId: string; ara: string };
  try {
    let response = await routes.getQuestionData(questionId, req.headers.authorization);
    if (response.status === 'error') res.send(response);

    const message = response;
    const ara_url = apiServices[ara as keyof typeof apiServices];
    const config = {
      method: 'POST',
      url: ara_url,
      data: message,
      transformResponse: [(data: unknown) => data],
    };

    let answer;
    try {
      response = await axios(config);
      try {
        answer = JSON.parse(response.data);
      } catch (error) {
        console.error(`Error parsing JSON response from ${ara}:`, error);
        answer = {
          status: 'error',
          message: `Received unparseable JSON response from ${ara}`,
        };
      }
    } catch (err) {
      answer = handleAxiosError(err as AxiosError);
    }

    response = await routes.createAnswer(
      { parent: questionId, visibility: 2 },
      req.headers.authorization
    );
    if (response.status === 'error') res.send(response);

    const answerId = response.id;
    response = await routes.setAnswerData(answerId, answer, req.headers.authorization);
    if (response.status === 'error') res.send(response);

    res.status(200).send({ id: answerId });
  } catch (error) {
    res.status(500).send(handleAxiosError(error as AxiosError));
  }
};
