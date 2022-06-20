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
  const partial_report = {
    failures: 0,
    success: 0,
    hints_requests: 0,
    hints_given: 0,
    total_attempts: 0,
  };

  questions_logs.forEach((logs) =>
    logs.forEach((log) => {
      if (log.semantic_event_name === 'ATTEMPT') {
        partial_report.total_attempts += 1;
      } else if (log.action_evaluation === 'INCORRECT') {
        partial_report.failures += 1;
      } else if (log.action_evaluation === 'CORRECT') {
        partial_report.success += 1;
      }
    })
  );
  console.log('questions_logs', questions_logs);

  const response = {
    id: questions_logs[0].question_name,
    name: questions_logs[0].question_name,
    failures: partial_report.failures,
    success: partial_report.success,
    hints_requests: partial_report.hints_requests,
    total_attempts: partial_report.total_attempts,
  };

  return response;
};
