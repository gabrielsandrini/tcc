const groupBy = (array, field) => {
  const groupedData = array.reduce((acc, value) => {
    if (!acc[value[field]]) {
      acc[value[field]] = [];
    }

    acc[value[field]].push(value);

    return acc;
  }, {});

  return groupedData;
};

export const groupByStudent = (array) => groupBy(array, 'user_id');

export const groupByQuestion = (questionArray) =>
  groupBy(questionArray, 'question_name');

const getMaxAndMinValues = (array, field) => {
  const max = Math.max(...array.map((item) => item[field]));
  const min = Math.min(...array.map((item) => item[field]));

  return { max, min };
};

export const getMinAndMaxDates = (array) =>
  getMaxAndMinValues(array, 'createdAt');

export const getSkills = (answersArray, attempt_id) => {
  /* Get the last logged values of each skill */
  const skills_by_attempt = answersArray
    .map((answer) => answer.skill)
    .filter((skill) => Boolean(skill?.probability))
    .reverse()
    .reduce((acc, skill) => {
      if (!acc[skill]) {
        acc[skill.name] = {
          name: skill.name,
          category: skill.category,
          value: skill.probability,
          attempt_id,
        };
      }

      return acc;
    }, {});

  const skill_array = Object.values(skills_by_attempt);
  return skill_array;
};

const calculateSkillsAverage = (skillsArray) => {
  const sum = skillsArray.reduce((acc, skill) => {
    acc += skill.value;
    return acc;
  }, 0);
  return sum / skillsArray.length;
};

export const getBestSkills = (skills) => {
  const bestSkill = skills.reduce(
    (acc, skill) => {
      const average = calculateSkillsAverage(skill);

      if (average > acc.average) {
        return { average, skill };
      }

      return acc;
    },
    { skills: skills[0], average: 0 }
  );

  return bestSkill.skill;
};

export const getBestSkillsFromAttempts = (attempts) => {
  const attemptsSkills = attempts.map((attempt) =>
    getSkills(attempt.answers, attempt.id)
  );

  const bestSkills =
    attemptsSkills.length > 1
      ? getBestSkills(attemptsSkills)
      : attemptsSkills[0];

  return bestSkills;
};

export const filterOneAttempt = (attempts, attempt_id) =>
  attempts.find((attempt) => attempt.id === attempt_id);

export const getQuestionsReport = (questions_logs) => {
  console.log('=============================');
  const question_reports = questions_logs.reduce((acc, logs) => {
    const partial_report = {
      question_name: '',
      failures: 0,
      success: 0,
      hints_requests: 0,
      total_attempts: 0,
    };

    logs.forEach((log) => {
      partial_report.question_name = log.question_name;

      if (log.semantic_event_name === 'ATTEMPT') {
        partial_report.total_attempts += 1;
      } else if (log.semantic_event_name === 'HINT_MSG') {
        partial_report.hints_requests += 1;
      } else if (log.action_evaluation === 'INCORRECT') {
        partial_report.failures += 1;
      } else if (log.action_evaluation === 'CORRECT') {
        partial_report.success += 1;
      }
    });

    // console.log(partial_report);
    partial_report.total_attempts -= 1;
    return [...acc, partial_report];
  }, []);

  return question_reports;
};

export const sumQuestionReports = (question_reports) => {
  const sum = question_reports.reduce((acc, report) => {
    report.forEach((value) => {
      const { question_name } = value;
      if (!question_name) {
        return;
      }

      if (acc[question_name]) {
        acc[question_name].failures += value.failures;
        acc[question_name].success += value.success;
        acc[question_name].hints_requests += value.hints_requests;
        acc[question_name].total_attempts += value.total_attempts;
      } else {
        acc[question_name] = value;
      }
    });

    return acc;
  }, {});

  return sum;
};

export const filterQuestionsReport = (questions) =>
  questions.filter((q) => q.question_name !== 'done');
