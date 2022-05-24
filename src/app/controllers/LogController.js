import xmlParser from 'xml2js';
import LogRepository from '../repository/LogRepository';

/* TODO list

1- confirm the "END_PROBLEM" label
*/
const data = {};

class LogController {
  async store(req, res) {
    const parsedData = await xmlParser.parseStringPromise(req.body.message);

    const attemptId = 'id123';
    /*
    context_data: {
      context_message_id: "594fe45d-f6f4-8756-972b-5178b86325af"
      name: "START_PROBLEM" | "END_PROBLEM"
    }
    ==> name only available in start and end problem requests
     */ /*
    const {
      $: context_data,
      /* ======= ONLY IN NON "START_PROBLEM" OR "END_PROBLEM" REQUESTS =======
      semantic_event,
      event_descriptor,
      custom_field,
      /* ==== ONLY IN "RESULT" REQUESTS  ====
      action_evaluation,
      tutor_advice,
      skill,
    } = parsedData; */

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

    const context_data = parsedData.$;
    /* START_PROBLEM | END_PROBLEM */
    const context_type = context_data?.name;

    const semantic_event = parsedData.semantic_event?.$;
    const semantic_event_type = semantic_event?.name;

    const event_descriptor = parsedData.event_descriptor.length
      ? parsedData.event_descriptor[0]
      : null;
    const questionName = event_descriptor.selection;
    const event_descriptor_action = event_descriptor?.action;
    const event_input = event_descriptor?.input;

    const { custom_field } = parsedData;
    const parsed_custom_field = custom_field.reduce(
      (acc, current) => ({ ...acc, [current.name]: current.value }),
      {}
    );

    const action_evaluation = parsedData.action_evaluation.length
      ? parsedData.action_evaluation[0]
      : null;
    const tutor_advice = parsedData.tutor_advice.length
      ? parsedData.tutor_advice[0]
      : null;

    const skill = parsedData.skill?.length ? parsedData.skill[0] : null;
    const skill_name = skill?.name[0];
    const skill_category = skill?.category[0];
    const skill_probability = skill.$.probability;

    if (context_type === 'START_PROBLEM') {
      const newAttempt = {
        attemptId,
        student: '',
        problem: '',
        startDate: new Date(),
        endDate: null,
        questions: {},
      };
      LogRepository.newAttempt(newAttempt);
      return;
    }
    if (context_type === 'END_PROBLEM') {
      LogRepository.closeAttempt(attemptId, { endDate: new Date() });
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
      skill: {
        category: skill_category,
        name: skill_name,
        probability: skill_probability,
      },
    };
    LogRepository.updateQuestion(questionName, questionData);
  }
}

export default new LogController();
