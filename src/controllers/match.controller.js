const matchService = require('../services/match.service');
const tournamentService = require('../services/tournament.service');
const { success, error } = require('../utils/response');

class MatchController {
  async create(req, res) {
    try {
      const match = await matchService.createMatch(req.body);
      success(res, match, 'Match created', 201);
    } catch (err) {
      error(res, err.message);
    }
  }

  async start(req, res) {
    try {
      const { match_id } = req.body;
      const match = await matchService.startMatch(match_id);
      success(res, match, 'Match started');
    } catch (err) {
      error(res, err.message);
    }
  }

  async addLive(req, res) {
    try {
      const { match_id, stream_url } = req.body;
      const match = await matchService.addLive(match_id, req.user.id, stream_url);
      success(res, match, 'Live stream added to match');
    } catch (err) {
      error(res, err.message, 400);
    }
  }

  async submit(req, res) {
    try {
      const { match_id, score, screenshot_url } = req.body;
      const proof = await matchService.submitResult(match_id, req.user.id, score, screenshot_url);
      
      // If match is finished, trigger tournament progression
      const match = await matchService.getMatchById(match_id);
      if (match.status === 'finished' && match.tournament_id) {
        await tournamentService.handleMatchFinished(match_id);
      }

      success(res, proof, 'Result submitted successfully');
    } catch (err) {
      error(res, err.message, 400);
    }
  }

  async setWinner(req, res) {
    try {
      const { match_id, winner_id, score_a, score_b } = req.body;
      const match = await matchService.manualResolve(match_id, winner_id, score_a, score_b);
      
      // Trigger progression
      if (match.tournament_id) {
        await tournamentService.handleMatchFinished(match_id);
      }
      
      success(res, match, 'Winner set successfully');
    } catch (err) {
      error(res, err.message);
    }
  }

  async getById(req, res) {
    try {
      const match = await matchService.getMatchById(req.params.id);
      success(res, match);
    } catch (err) {
      error(res, err.message, 404);
    }
  }
}

module.exports = new MatchController();
