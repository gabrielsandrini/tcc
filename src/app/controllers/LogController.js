import xmlParser from 'xml2js';
import LogRepository from '../repository/LogRepository';
import { AnswerModel } from '../schemas/Attempts';

class LogController {
  async store(req, res) {
    const { message, questionary_key, user_name, user_id, attempt_id } =
      req.body;

    const parsedData = await xmlParser.parseStringPromise(message);

    // return res.json(parsedData);
    /*
      student:
      problem:
      start-date:
      end-date:
      questions:{
        [question-name(event_descriptor.selection)]:[
          {
            semantic_event_name: 'ATTEMPT' | 'RESULT' | 'HINT'
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

    const context_data = parsedData.context_message?.$;
    /* START_PROBLEM | END_PROBLEM */
    const context_type = context_data?.name;

    /*
      data.tutor_message = RESULT requests
      data.tool_message = ATTEMPT requests
      data = START_PROBLEM | END_PROBLEM requests
    */
    const toolMessage =
      parsedData.tutor_message || parsedData.tool_message || parsedData;

    const semantic_event = toolMessage.semantic_event?.length
      ? toolMessage.semantic_event[0].$
      : null;
    /* ATTEMPT | RESULT | HINT */
    const semantic_event_name = semantic_event?.name;

    const event_descriptor = toolMessage.event_descriptor?.length
      ? toolMessage.event_descriptor[0]
      : null;
    const questionName = event_descriptor?.selection.length
      ? event_descriptor?.selection[0]
      : null;
    const event_descriptor_action = event_descriptor?.action[0];
    const event_descriptor_input = event_descriptor?.input[0];

    const { custom_field } = toolMessage;
    const parsed_custom_field = custom_field?.reduce(
      (acc, current) => ({ ...acc, [current.name]: current.value[0] }),
      {}
    );
    const custom_field_tool_event_time = parsed_custom_field?.tool_event_time;
    const custom_field_tutor_input = parsed_custom_field?.tutor_input;
    const custom_field_step_id = parsed_custom_field?.step_id;

    /* CORRECT | INCORRECT */
    const action_evaluation = toolMessage.action_evaluation?.length
      ? toolMessage.action_evaluation[0].$ || toolMessage.action_evaluation[0]
      : null;
    console.log(toolMessage.action_evaluation, action_evaluation);
    const tutor_advice = toolMessage.tutor_advice?.length
      ? toolMessage.tutor_advice[0]
      : null;

    const skill = toolMessage.skill?.length ? toolMessage.skill[0] : null;
    const skill_name = skill?.name[0];
    const skill_category = skill?.category[0];
    const skill_probability = skill?.$?.probability;

    const savedAttempt = await LogRepository.getAttempt(attempt_id);
    if (context_type === 'START_PROBLEM') {
      if (savedAttempt) {
        return res.json({ saved: false, reason: 'Attempt already exists' });
      }

      const response = await LogRepository.newAttempt({
        attempt_id,
        user_id,
        user_name,
        questionary_key,
      });
      return res.json(response);
    }

    if (questionName === 'done' && !savedAttempt.done) {
      await LogRepository.finishAttempt(attempt_id);
    }

    if (!context_type && !semantic_event_name) {
      // request com o id da sessão, bem util no futuro
      console.log('Request não mapeada');
      console.log(
        'semantic_event',
        semantic_event,
        'context_type',
        context_type
      );
      return res.json({ notSaved: true, parsedData });
    }

    const answerData = new AnswerModel({
      question_name: questionName,
      semantic_event_name,
      event_descriptor: {
        action: event_descriptor_action,
        input: event_descriptor_input,
      },
      custom_field: {
        tool_event_time: custom_field_tool_event_time,
        tutor_input: custom_field_tutor_input,
        step_id: custom_field_step_id,
      },
      action_evaluation,
      tutor_advice,
      skill: {
        probability: skill_probability,
        name: skill_name,
        category: skill_category,
      },
    });

    if (semantic_event_name === 'HINT_REQUEST') {
      await LogRepository.updateHint({
        attempt_id,
        hint: answerData,
      });

      return res.json({
        hint: true,
        saved: await LogRepository.getAttempt(attempt_id),
        parsedData,
      });
    }

    await LogRepository.updateQuestion({
      attempt_id,
      answer: answerData,
    });

    return res.json({
      saved: await LogRepository.getAttempt(attempt_id),
      parsedData,
    });
  }
}

export default new LogController();
