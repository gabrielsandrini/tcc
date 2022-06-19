import {
  filterOneAttempt,
  getBestSkillsFromAttempts,
  getMinAndMaxDates,
  getSkills,
  groupByStudent,
} from '../../Service/helper';
import LogRepository from '../repository/LogRepository';

class ReportController {
  async relatorioTurma(req, res) {
    const { form_id } = req.query;

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
        id: best_attempt.id,
        date: best_attempt.createdAt,
        skills: bestSkills,
        done: best_attempt.done,
      },
      attempts: student_attempts.map((attempt) => ({
        id: attempt.id,
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

  relatorioQuestao(req, res) {
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

    return res.json(data);
  }

  relatorioQuestaoTurma(req, res) {
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

    return res.json(data);
  }
}

export default new ReportController();
