/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-undef */
/* eslint-disable prefer-arrow-callback */
// Apontar para o arquivo de lógica
const myVars = {
  question_file: '../FinalBRDs/logica.brd',
  tutoring_service_communication: 'javascript',
};

// The CTAT JavaScript code looks for a ctatOnload() function and
// executes it automatically if it is defined in your tutor.
// eslint-disable-next-line no-unused-vars
function ctatOnload() {
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
    xhttp.send(JSON.stringify({ message: aMessage }));
  }

  initTutor(myVars);

  var logLibrary = CTATCommShell.commShell.getLoggingLibrary();
  logLibrary.assignLogListener(function logListener(aMessage) {
    sendLog(aMessage);
  });
}
