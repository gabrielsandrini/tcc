class LogRepository {
  constructor() {
    this.data = {
      questions: {},
      hint_requests: [],
    };
  }

  newAttempt(data) {
    this.data = { ...data };
    return { ...this.data };
  }

  // eslint-disable-next-line no-unused-vars
  getAttempt(attemptId) {
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

  updateHint(hint) {
    const newHints = this.data.hint_requests.concat(hint);
    // console.log('aaaa', JSON.stringify({ hint, newHints }));
    this.data = { ...this.data, hint_requests: newHints };

    return { ...this.data };
  }
}

export default new LogRepository();
