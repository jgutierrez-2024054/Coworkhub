const memberService = require('../services/MemberService');
const memberRepository = require('../repositories/MemberRepository');
const { ok } = require('../helpers/response');
const { DomainError } = require('../middlewares/errorHandler');

async function list(req, res, next) {
  try {
    const members = await memberService.list();
    return ok(res, members);
  } catch (err) { return next(err); }
}

async function detail(req, res, next) {
  try {
    const member = await memberService.getOrFail(req.params.id);
    return ok(res, member);
  } catch (err) { return next(err); }
}

async function assignPlan(req, res, next) {
  try {
    const member = await memberService.assignPlan(req.params.id, req.body.planId);
    return ok(res, member);
  } catch (err) { return next(err); }
}

async function selectMyPlan(req, res, next) {
  try {
    const { planId } = req.body;
    const memberId = req.user.id; // Usar req.user.id en lugar de req.user.sub
    
    // Verificar si el miembro existe
    const currentMember = await memberRepository.findById(memberId);
    if (!currentMember) {
      throw new DomainError(404, 'Miembro no encontrado.');
    }
    
    // Asignar el plan (ahora permite cambiar de plan existente)
    const member = await memberService.assignPlan(memberId, planId);
    return ok(res, member);
  } catch (err) { return next(err); }
}

module.exports = { list, detail, assignPlan, selectMyPlan };
