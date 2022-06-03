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

  async newAttempt({ attempt_id, student_ra, student_name, questionary }) {
    const schema = new Attempt({
      attempt_id,
      student_ra,
      student_name,
      questionary,
    });
    return schema.save();
  }

  async getAttempt(attempt_id) {
    // const result = await Attempt.findOne({ attempt_id });
    return { getAttempt: true, attempt_id };
  }

  async finishAttempt(attempt_id) {
    const schema = await Attempt.findOneAndUpdate(
      { attempt_id },
      { done: true, end_date: new Date() }
    );
    return schema;
  }

  async updateQuestion({ attempt_id, answer }) {
    const schema = await Attempt.findOneAndUpdate(
      { attempt_id },
      {
        $push: {
          answers: answer,
        },
      },
      this.logError
    );
    return schema;
  }

  async updateHint({ attempt_id, hint }) {
    const schema = await Attempt.findOneAndUpdate(
      { attempt_id },
      {
        $push: {
          hints: hint,
        },
      },
      this.logError
    );
    return schema;
  }
}

export default new LogRepository();
