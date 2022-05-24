class LogRepository {
  constructor() {
    this.data = {
      questions: {},
    };
  }

  newAttempt(data) {
    // console.log('newAttempt');
    this.data = { ...data };
    return { ...this.data };
  }

  // eslint-disable-next-line no-unused-vars
  getAttempt(attemptId) {
    // this.data.find((i) => i.id === attemptId);
    console.log(this.data);
    return { ...this.data };
  }

  updateAttempt(attemptId, data) {
    this.data = { ...this.data, ...data };
    return { ...this.data };
  }

  updateQuestion(question, data) {
    if (!this.data?.questions[question]) {
      this.data.questions[question] = [];
    }
    this.data.questions[question] = this.data.questions[question].concat(data);

    return { ...this.data };
  }
}

export default new LogRepository();
