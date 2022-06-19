import Attempt from '../schemas/Attempts';

class LogRepository {
  constructor() {
    this.data = {
      questions: {},
      hint_requests: [],
    };
  }

  logError(error, success) {
    if (error) {
      console.log(error);
      throw new Error(error);
    } else {
      console.log(success);
    }
  }

  async newAttempt({ attempt_id, user_id, user_name, questionary_key }) {
    const schema = new Attempt({
      attempt_id,
      user_id,
      user_name,
      questionary_key,
    });
    const result = await schema.save();
    return result;
  }

  async finishAttempt(attempt_id) {
    const query = Attempt.findOneAndUpdate(
      { attempt_id },
      { done: true, end_date: new Date() }
    );
    const result = await query;
    return result;
  }

  async updateQuestion({ attempt_id, answer }) {
    console.log('answer', answer);
    const query = Attempt.findOneAndUpdate(
      { attempt_id },
      {
        $push: {
          answers: answer,
        },
      }
    );

    const result = await query;
    return result;
  }

  async updateHint({ attempt_id, hint }) {
    const query = await Attempt.findOneAndUpdate(
      { attempt_id },
      {
        $push: {
          hints: hint,
        },
      }
    );

    const result = await query;
    return result;
  }

  async getByFormId(form_id) {
    const result = await Attempt.find({ questionary_key: form_id });
    return result;
  }

  async getByFormIdAndStudent({ form_id, student_id }) {
    const result = await Attempt.find({
      questionary_key: form_id,
      user_id: student_id,
    });
    return result;
  }

  async getAttempt(attempt_id) {
    const result = await Attempt.findOne({ attempt_id });
    return result;
  }
}

export default new LogRepository();
