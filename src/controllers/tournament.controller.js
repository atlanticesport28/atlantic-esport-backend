const tournamentService = require('../services/tournament.service');
const { success, error } = require('../utils/response');

class TournamentController {
  async create(req, res) {
    try {
      const tournament = await tournamentService.createTournament({
        ...req.body,
        organizer_id: req.user.id
      });
      success(res, tournament, 'Tournament created as draft', 201);
    } catch (err) {
      error(res, err.message);
    }
  }

  async edit(req, res) {
    try {
      const tournament = await tournamentService.updateTournament(req.params.id, req.body, req.user.id);
      success(res, tournament, 'Tournament updated successfully');
    } catch (err) {
      error(res, err.message);
    }
  }

  async submit(req, res) {
    try {
      const tournament = await tournamentService.submitForApproval(req.params.id, req.user.id);
      success(res, tournament, 'Tournament submitted for approval');
    } catch (err) {
      error(res, err.message);
    }
  }

  async join(req, res) {
    try {
      const { tournament_id } = req.body;
      const participation = await tournamentService.joinTournament(tournament_id, req.user.id);
      success(res, participation, 'Joined tournament successfully');
    } catch (err) {
      error(res, err.message, 400);
    }
  }

  async getAll(req, res) {
    try {
      const tournaments = await tournamentService.getTournaments(req.query);
      success(res, tournaments);
    } catch (err) {
      error(res, err.message);
    }
  }

  async getById(req, res) {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);
      success(res, tournament);
    } catch (err) {
      error(res, err.message, 404);
    }
  }

  async getMyTournaments(req, res) {
    try {
      const tournaments = await tournamentService.getMyTournaments(req.user.id);
      success(res, tournaments);
    } catch (err) {
      error(res, err.message);
    }
  }

  async start(req, res) {
    try {
      const matches = await tournamentService.startTournament(req.params.id, req.user.id);
      success(res, matches, 'Tournament started and first round matches generated');
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new TournamentController();
