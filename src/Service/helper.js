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

const getMaxAndMinValues = (array, field) => {
  const max = Math.max(...array.map((item) => item[field]));
  const min = Math.min(...array.map((item) => item[field]));

  return { max, min };
};

export const getMinAndMaxDates = (array) =>
  getMaxAndMinValues(array, 'createdAt');

export const getSkills = (answersArray) => {
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
  const attemptsSkills = attempts.map((attempt) => getSkills(attempt.answers));

  const bestSkills =
    attemptsSkills.length > 1
      ? getBestSkills(attemptsSkills)
      : attemptsSkills[0];

  return bestSkills;
};
