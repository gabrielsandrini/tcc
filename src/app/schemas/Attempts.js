import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  question_name: { type: String, required: true },
  semantic_event_name: { type: String, required: true },
  event_descriptor: {
    action: { type: String, required: true },
    input: { type: String, required: true },
  },
  custom_field: {
    tool_event_time: { type: Date, required: false },
    tutor_input: { type: String, required: false },
    step_id: { type: Number, required: false },
  },
  action_evaluation: Object,
  tutor_advice: { type: String, required: false },
  skill: {
    probability: { type: Number, required: false },
    name: { type: String, required: false },
    category: { type: String, required: false },
  },
});
export const AnswerModel = mongoose.model('Answer', AnswerSchema);

const AttemptSchema = new mongoose.Schema(
  {
    attempt_id: { type: String, required: true },
    questionary_key: { type: String, required: true },
    user_id: { type: String, required: true },
    user_name: { type: String, required: false },
    end_date: { type: Date, required: false },
    done: { type: Boolean, required: false, default: false },
    answers: { type: [AnswerSchema], required: false, default: [] },
    hints: { type: [AnswerSchema], required: false, default: [] },
  },
  {
    timestamps: true,
  }
);
const AttemptModel = mongoose.model('Attempts', AttemptSchema);

export default AttemptModel;
