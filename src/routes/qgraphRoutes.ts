import { Router } from 'express';
import {
  biolink,
  createDocAnswer,
  createDocQuestion,
  deleteDocAnswer,
  deleteDocQuestion,
  drugDiseases,
  getDocAnswer,
  getDocAnswerData,
  getDocAnswersByQuestion,
  getDocQuestion,
  getDocQuestionData,
  getDocQuestions,
  nameResolver,
  nodeNorm,
  postAnswer,
  quickAnswer,
  setDocAnswerData,
  setDocQuestionData,
  updateDocAnswer,
  updateDocQuestion,
} from '../controllers/qgraphController';

const router = Router();

router.post('/node_norm', nodeNorm);
router.post('/name_resolver', nameResolver);
router.get('/biolink', biolink);
router
  .route('/robokache/question/:doc_id')
  .get(getDocQuestion)
  .post(createDocQuestion)
  .put(updateDocQuestion)
  .delete(deleteDocQuestion);
router.route('/robokache/question_data/:doc_id').get(getDocQuestionData).put(setDocQuestionData);
router.get('/robokache/questions', getDocQuestions);
router.post('/robokache/answer', createDocAnswer);
router
  .route('/robokache/answer/:doc_id')
  .get(getDocAnswer)
  .put(updateDocAnswer)
  .delete(deleteDocAnswer);
router.route('/robokache/answer_data/:doc_id').get(getDocAnswerData).put(setDocAnswerData);
router.get('/robokache/answers/:doc_id', getDocAnswersByQuestion);
router.post('/quick_answer', quickAnswer);
router.post('/explore/drug-disease', drugDiseases);
router.post('/answer', postAnswer);

export default router;
