import axiosClient from "./axiosClient";

type QueryParams = Record<string, unknown>;

const LessonQuestionService = {
  getLessonQuestions: async (courseId: number | string, lessonId: number | string) =>
    (await axiosClient.get(`/courses/${courseId}/lessons/${lessonId}/questions`)).data,

  createQuestion: async (courseId: number | string, lessonId: number | string, payload: { title: string; content: string }) =>
    (await axiosClient.post(`/courses/${courseId}/lessons/${lessonId}/questions`, payload)).data,

  replyQuestion: async (questionId: number | string, payload: { content: string }) =>
    (await axiosClient.post(`/lesson-questions/${questionId}/replies`, payload)).data,

  resolveQuestion: async (questionId: number | string) =>
    (await axiosClient.patch(`/lesson-questions/${questionId}/resolved`)).data,

  getSellerQuestions: async (sellerId: number | string, params: QueryParams = {}) =>
    (await axiosClient.get(`/seller/${sellerId}/lesson-questions`, { params })).data,
};

export default LessonQuestionService;
