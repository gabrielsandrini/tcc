import xmlParser from 'xml2js';

class LogController {
  async parse(req, res) {
    // console.log(req.body);

    const response = await xmlParser.parseStringPromise(req.body.message);

    return res.json(response);
  }
}

export default new LogController();
