const ArchitectAgent = require('./architect');
const CoderAgent = require('./coder');
const DebuggerAgent = require('./debugger');
const ResearcherAgent = require('./researcher');
const TesterAgent = require('./tester');
const ReviewerAgent = require('./reviewer');
const SecurityReviewerAgent = require('./security');
const DocumentationSpecialist = require('./docs');
const AutomationSpecialist = require('./automation');

function createSpecialistTeam() {
  return {
    architect: new ArchitectAgent(),
    coder: new CoderAgent(),
    developer: new CoderAgent(), // alias
    debugger: new DebuggerAgent(),
    researcher: new ResearcherAgent(),
    tester: new TesterAgent(),
    reviewer: new ReviewerAgent(),
    security: new SecurityReviewerAgent(),
    docs: new DocumentationSpecialist(),
    documentation: new DocumentationSpecialist(), // alias
    automation: new AutomationSpecialist(),
    orchestrator: new AutomationSpecialist() // alias
  };
}

module.exports = {
  createSpecialistTeam,
  ArchitectAgent,
  CoderAgent,
  DebuggerAgent,
  ResearcherAgent,
  TesterAgent,
  ReviewerAgent,
  SecurityReviewerAgent,
  DocumentationSpecialist,
  AutomationSpecialist
};
