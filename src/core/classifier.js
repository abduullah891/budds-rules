/**
 * Context-Based Skill Selection & Task Classifier v2.0
 * Evaluates intent, complexity, languages, frameworks, tools, and expertise
 * Automatically selects relevant modules without requiring user to run `/skill`
 */
class TaskClassifier {
  constructor() {
    this.languages = {
      javascript: ['javascript', 'js', 'node', 'nodejs', 'npm', 'yarn', 'pnpm', 'bun'],
      typescript: ['typescript', 'ts', 'tsx'],
      python: ['python', 'py', 'pip', 'poetry', 'conda', 'pytest'],
      go: ['go', 'golang', 'goroutine', 'gin'],
      rust: ['rust', 'cargo', 'rustc'],
      php: ['php', 'composer', 'laravel', 'artisan', 'symfony'],
      java: ['java', 'maven', 'gradle', 'spring', 'springboot'],
      sql: ['sql', 'postgres', 'postgresql', 'mysql', 'sqlite', 'prisma', 'typeorm', 'migration', 'migrations'],
      shell: ['bash', 'sh', 'zsh', 'powershell', 'cmd']
    };

    this.frameworks = {
      react: ['react', 'jsx', 'next', 'nextjs'],
      vue: ['vue', 'nuxt'],
      express: ['express', 'nestjs', 'fastify'],
      django: ['django', 'fastapi', 'flask'],
      laravel: ['laravel', 'eloquent', 'artisan']
    };

    this.domainSignatures = {
      development: {
        keywords: ['build', 'create', 'implement', 'feature', 'features', 'refactor', 'develop', 'component', 'components', 'endpoint', 'endpoints', 'api', 'apis', 'architecture', 'code', 'function', 'functions', 'class', 'classes', 'module', 'modules', 'rebuild'],
        extensions: ['.js', '.ts', '.py', '.go', '.rs', '.cpp', '.jsx', '.tsx', '.vue', '.html', '.css', '.php', '.java'],
        specialist: 'coder',
        priority: 1
      },
      debugging: {
        keywords: ['debug', 'debugging', 'debugger', 'bug', 'bugs', 'error', 'errors', 'fix', 'fixes', 'crash', 'crashes', 'fail', 'fails', 'failing', 'failure', 'failures', 'exception', 'exceptions', 'traceback', 'broken', 'issue', 'issues', 'solve', 'triage', 'isolate'],
        extensions: ['.log', '.stack', '.dump'],
        specialist: 'debugger',
        priority: 1
      },
      testing: {
        keywords: ['test', 'tests', 'testing', 'unit test', 'unit tests', 'integration test', 'integration tests', 'jest', 'vitest', 'pytest', 'coverage', 'mock', 'mocks', 'assert', 'assertion', 'assertions', 'benchmark', 'benchmarks', 'verify', 'verification', 'validate', 'validation'],
        extensions: ['.test.js', '.spec.js', '.test.ts', '.spec.ts', '_test.go', 'test_*.py'],
        specialist: 'tester',
        priority: 2
      },
      research: {
        keywords: ['research', 'investigate', 'investigation', 'analyze', 'analysis', 'study', 'search', 'docs', 'documentation', 'learn', 'explore', 'compare', 'evaluate', 'evaluation', 'sitemap'],
        extensions: ['.md', '.pdf', '.json'],
        specialist: 'researcher',
        priority: 2
      },
      automation: {
        keywords: ['automate', 'automation', 'script', 'scripts', 'scripting', 'cli', 'installer', 'installers', 'pipeline', 'pipelines', 'workflow', 'workflows', 'cron', 'ci/cd', 'github actions', 'deploy', 'deployment', 'doctor', 'orchestrate', 'orchestration'],
        extensions: ['.sh', '.bash', '.ps1', '.yml', '.yaml'],
        specialist: 'orchestrator',
        priority: 2
      },
      documentation: {
        keywords: ['doc', 'docs', 'documentation', 'readme', 'changelog', 'guide', 'guides', 'manual', 'manuals', 'explain', 'explanation', 'comment', 'comments', 'docstring', 'docstrings', 'specification', 'specifications', 'spec', 'specs'],
        extensions: ['.md', '.rst', '.txt'],
        specialist: 'architect',
        priority: 3
      }
    };
  }

  detectLanguages(text) {
    const detected = [];
    const lower = text.toLowerCase();
    for (const [lang, keywords] of Object.entries(this.languages)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
        detected.push(lang);
      }
    }
    return detected;
  }

  detectFrameworks(text) {
    const detected = [];
    const lower = text.toLowerCase();
    for (const [fw, keywords] of Object.entries(this.frameworks)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
        detected.push(fw);
      }
    }
    return detected;
  }

  detectComplexity(text) {
    const lower = text.toLowerCase();
    if (lower.includes('rebuild') || lower.includes('architect') || lower.includes('enterprise') || lower.includes('fullstack') || lower.includes('system')) {
      return 'architectural';
    }
    if (lower.includes('refactor') || lower.includes('migration') || lower.includes('integrate') || lower.includes('pipeline')) {
      return 'complex';
    }
    if (lower.includes('quick') || lower.includes('simple') || lower.includes('typo') || lower.includes('rename')) {
      return 'simple';
    }
    return 'moderate';
  }

  /**
   * Classify a task prompt and workspace context into matched skills and specialists
   * @param {string} prompt - User request or task description
   * @param {Object} context - Optional workspace context (files, open tab, recent errors)
   * @returns {Object} Comprehensive classification result
   */
  classify(prompt, context = {}) {
    if (!prompt || typeof prompt !== 'string') {
      return {
        domains: ['development'],
        primaryDomain: 'development',
        specialists: ['coder'],
        leadSpecialist: 'coder',
        mode: 'auto',
        complexity: 'simple',
        languages: [],
        frameworks: [],
        confidence: 0.5,
        autoLoadedSkills: ['development']
      };
    }

    const lower = prompt.toLowerCase();
    const scores = {};

    for (const [domain, config] of Object.entries(this.domainSignatures)) {
      scores[domain] = 0;

      // Keyword matching with word boundary
      for (const kw of config.keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(lower)) {
          scores[domain] += 2;
        }
      }

      // Check context file extensions if available
      if (context.files && Array.isArray(context.files)) {
        for (const file of context.files) {
          if (config.extensions.some(ext => file.endsWith(ext))) {
            scores[domain] += 1;
          }
        }
      }

      // Check if context has recent errors -> boosts debugging
      if (context.hasErrors && domain === 'debugging') {
        scores[domain] += 5;
      }
    }

    // Sort domains by score
    const ranked = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    const domains = ranked.length > 0 ? ranked.map(([d]) => d) : ['development'];
    const primaryDomain = domains[0] || 'development';

    // Collect required specialists
    const specialists = Array.from(new Set(domains.map(d => this.domainSignatures[d]?.specialist || 'coder')));
    const leadSpecialist = this.domainSignatures[primaryDomain]?.specialist || 'coder';

    // Language & Framework intelligence
    const languages = this.detectLanguages(prompt);
    const frameworks = this.detectFrameworks(prompt);
    const complexity = this.detectComplexity(prompt);

    // Auto-detect mode
    let mode = 'auto';
    if (complexity === 'architectural' || lower.includes('deep')) {
      mode = 'deep-dive';
    } else if (complexity === 'simple') {
      mode = 'fast';
    } else if (lower.includes('audit') || lower.includes('strict') || lower.includes('never give up')) {
      mode = 'resilient';
    }

    return {
      domains,
      primaryDomain,
      specialists,
      leadSpecialist,
      mode,
      complexity,
      languages,
      frameworks,
      confidence: ranked.length > 0 ? Math.min(1.0, ranked[0][1] / 10 + 0.3) : 0.4,
      autoLoadedSkills: domains
    };
  }
}

module.exports = TaskClassifier;
