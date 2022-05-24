import xmlParser from 'xml2js';
import LogRepository from '../repository/LogRepository';

class LogController {
  async store(req, res) {
    const parsedData = await xmlParser.parseStringPromise(req.body.message);

    const attemptId = 'id123';

    /*
      student:
      problem:
      start-date:
      end-date:
      questions:{
        [question-name(event_descriptor.selection)]:[
          {
            semantic_event_type: 'ATTEMPT' | 'RESULT' | 'HINT'
            event_descriptor: {
              action: string
              input: string
            }
            custom_field {
              tool_event_time: timestring
              tutor_input(RESULT ONLY): string
              step_id(RESULT ONLY): int
            },
            action_evaluation: string
            tutor_advice: string
            skill:{
              probability: real,
              name:
              category:
            }
          }
        ]
      },
    */

    // console.log(parsedData);

    const context_data = parsedData.context_message?.$;
    /* START_PROBLEM | END_PROBLEM */
    const context_type = context_data?.name;

    const toolMessage = parsedData.tool_message || parsedData;

    const semantic_event = toolMessage.semantic_event?.length
      ? toolMessage.semantic_event[0].$
      : null;
    const semantic_event_type = semantic_event?.name;

    const event_descriptor = toolMessage.event_descriptor?.length
      ? toolMessage.event_descriptor[0]
      : null;
    const questionName = event_descriptor?.selection;
    const event_descriptor_action = event_descriptor?.action;
    const event_input = event_descriptor?.input;

    const { custom_field } = toolMessage;
    const parsed_custom_field = custom_field?.reduce(
      (acc, current) => ({ ...acc, [current.name]: current.value }),
      {}
    );

    const action_evaluation = toolMessage.action_evaluation?.length
      ? toolMessage.action_evaluation[0]
      : null;
    const tutor_advice = toolMessage.tutor_advice?.length
      ? toolMessage.tutor_advice[0]
      : null;

    const skill = toolMessage.skill?.length ? toolMessage.skill[0] : null;
    const skill_name = skill?.name[0];
    const skill_category = skill?.category[0];
    const skill_probability = skill?.$?.probability;

    if (context_type === 'START_PROBLEM') {
      const newAttempt = {
        attemptId,
        student: '',
        problem: '',
        startDate: new Date(),
        endDate: null,
        questions: {},
      };
      return res.json(LogRepository.newAttempt(newAttempt));
    }

    if (context_type === 'END_PROBLEM') {
      return res.json(
        LogRepository.updateAttempt(attemptId, { endDate: new Date() })
      );
    }

    // console.log(semantic_event);
    if (!context_type && !semantic_event_type) {
      // request com o id da sessão, bem útil no futuro
      console.log('Request não mapeada');
      return res.json({ notSaved: true, parsedData });
    }

    const questionData = {
      semantic_event_type,
      event_descriptor: {
        action: event_descriptor_action,
        input: event_input,
      },
      custom_field: parsed_custom_field,
      action_evaluation,
      tutor_advice,
    };
    if (skill) {
      Object.assign(questionData, {
        skill: {
          category: skill_category,
          name: skill_name,
          probability: skill_probability,
        },
      });
    }

    // return res.json();
    LogRepository.updateQuestion(questionName, questionData);
    return res.json(LogRepository.getAttempt(attemptId));
  }
}

export default new LogController();
