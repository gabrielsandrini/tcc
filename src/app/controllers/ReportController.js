import {
  filterOneAttempt,
  filterQuestionsReport,
  getBestSkillsFromAttempts,
  getMinAndMaxDates,
  getQuestionsReport,
  getSkills,
  groupByQuestion,
  groupByStudent,
  sumQuestionReports,
} from '../services/helper';
import LogRepository from '../repository/LogRepository';

class ReportController {
  async relatorioTurma(req, res) {
    const { form_id } = req.query;

    if (!form_id) {
      throw new Error('Form ID não enviado');
    }

    const attempts = await LogRepository.getByFormId(form_id);

    const attemptsGroupedByStudent = groupByStudent(attempts);

    const result = Object.keys(attemptsGroupedByStudent).map((studentId) => {
      const student_attempts = attemptsGroupedByStudent[studentId];
      const { max, min } = getMinAndMaxDates(student_attempts);

      const bestSkills = getBestSkillsFromAttempts(student_attempts);

      return {
        id: studentId,
        form_id: student_attempts[0].questionary_key,
        first_attempt: min,
        last_attempt: max,
        aluno: {
          nome: student_attempts[0].user_name,
          prontuario: student_attempts[0].user_id,
        },
        skills: bestSkills,
        tentativas: student_attempts.length,
      };
    });

    /*
    Pegar todas as tentativas de um form
    Agrupar por aluno
    Pegar a data de inicio da primeira e da ultima tentativa
    Pegar as skills da melhor tentativa
    Count do numero de tentativas
    */

    return res.json(result);
  }

  async relatorioAluno(req, res) {
    const { form_id, student_id } = req.query;

    if (!form_id) {
      throw new Error('Form ID não enviado');
    }

    if (!student_id) {
      throw new Error('ID do estudante não enviado');
    }

    const student_attempts = await LogRepository.getByFormIdAndStudent({
      form_id,
      student_id,
    });

    const bestSkills = getBestSkillsFromAttempts(student_attempts);
    const best_attempt = filterOneAttempt(
      student_attempts,
      bestSkills[0].attempt_id
    );

    const response = {
      form_id: best_attempt.questionary_key,
      aluno: {
        nome: best_attempt.user_name,
        prontuario: best_attempt.user_id,
      },
      best_attempt: {
        id: best_attempt.attempt_id,
        date: best_attempt.createdAt,
        skills: bestSkills,
        done: best_attempt.done,
      },
      attempts: student_attempts.map((attempt) => ({
        id: attempt.attempt_id,
        date: attempt.createdAt,
        skills: getSkills(attempt.answers),
        done: attempt.done,
      })),
    };

    return res.json(response);
    /*
    {
      nome_aluno: 'Aluno 1',
      best_attempt: {
        id: '2',
        date: '2020-01-01',
        skills: [
          { key: 'skill 1', value: '0.98%' },
          { key: 'skill 2', value: '0.98%' },
          { key: 'skill 3', value: '0.98%' },
        ],
        done: true,
      },
      attempts: [
        {
          id: '2',
          date: '2020-01-01',
          skills: [
            { key: 'skill 1', value: '0.98%' },
            { key: 'skill 2', value: '0.98%' },
            { key: 'skill 3', value: '0.98%' },
          ],
          done: false,
        },
      ],
    };


    Pegar todas as tentativas de um aluno em um form
    */
  }

  async relatorioQuestao(req, res) {
    const { attempt_id } = req.query;

    if (!attempt_id) {
      throw new Error('ID da tentativa não enviado');
    }

    const attempt = await LogRepository.getAttempt(attempt_id);

    const groupedAnswers = groupByQuestion(attempt.answers);

    const questionsReport = getQuestionsReport(Object.values(groupedAnswers));

    const filteredQuestionsReport = filterQuestionsReport(questionsReport);

    const response = {
      id: attempt.attempt_id,
      form_id: attempt.questionary_key,
      aluno: {
        nome: attempt.user_name,
        prontuario: attempt.user_id,
      },
      report: filteredQuestionsReport,
    };

    return res.json(response);
    /*
    const data = {
      aluno_id: 1,
      aluno_nome: 'Aluno 1',
      form_token: 'token',
      reports: [
        {
          id: 1,
          questao: 'Questão 1',
          falhas: 2,
          sucessos: 3,
          dicas: 4,
          tentativas: 5,
        },
      ],
    };
 */
  }

  async relatorioQuestaoTurma(req, res) {
    const { form_token } = req.query;

    if (!form_token) {
      throw new Error('Form token não enviado');
    }

    const attempts = await LogRepository.getByFormId(form_token);

    const responses = attempts.map((attempt) => {
      const groupedAnswers = groupByQuestion(attempt.answers);

      const questionsReport = getQuestionsReport(Object.values(groupedAnswers));

      const filteredQuestionsReport = filterQuestionsReport(questionsReport);

      return filteredQuestionsReport;
    });

    const sum = sumQuestionReports(responses);

    return res.json({
      report: Object.values(sum),
    });
  }
}

export default new ReportController();
