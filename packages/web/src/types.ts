export type QuestionMessage = {
  message: string;
};

export type AnswerMessage = {
  items: {
    description: string;
    id: string;
    image_url: string;
  }[];
  message: string;
};
