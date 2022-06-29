/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-undef */
/* eslint-disable prefer-arrow-callback */
// Apontar para o arquivo de lógica
const myVars = {
  question_file: '../FinalBRDs/tcc.brd',
  tutoring_service_communication: 'javascript',
};

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i += 1) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return null;
}

function generateUniqueId() {
  return Math.floor(Math.random() * Date.now());
}

// The CTAT JavaScript code looks for a ctatOnload() function and
// executes it automatically if it is defined in your tutor.
// eslint-disable-next-line no-unused-vars
function ctatOnload() {
  const questionary_key = getQueryVariable('questionary_key');
  const user_name = getQueryVariable('user_name');
  const user_id = getQueryVariable('user_id');
  const attempt_id = generateUniqueId();

  function sendLog(aMessage) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        console.log('=============DEU BOM====================');
      } else if (this.status >= 400) {
        console.error('DEU RUINZÃO');
      }
    };

    console.warn(`Log message: ${typeof aMessage}${aMessage}`);
    xhttp.open('POST', 'http://127.0.0.1:3333/log', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(
      JSON.stringify({
        message: aMessage,
        questionary_key,
        user_name,
        user_id,
        attempt_id,
      })
    );
  }

  initTutor(myVars);

  var logLibrary = CTATCommShell.commShell.getLoggingLibrary();
  logLibrary.assignLogListener(function logListener(aMessage) {
    sendLog(aMessage);
  });
}
