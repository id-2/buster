// Create a custom command for login
Cypress.Commands.add('loginToBuster', (email = 'chad@buster.so', password = 'password') => {
  cy.visit('localhost:3000');
  cy.get('#email').clear().type(email);
  cy.get('#password').clear().type(password);
  cy.get('.mb-1\\.5 > .busterv2-typography').click();
  cy.get(':nth-child(8) > .busterv2-btn > span').click();
  cy.wait(2500);
});

Cypress.Commands.add('askQuestion', (question: string) => {
  cy.get('[data-cy="new-metric-button"] > .busterv2-btn-icon > .material-symbols').click();
  cy.get('.busterv2-input').click();
  cy.get('.busterv2-input').type(question);
  cy.get('.busterv2-input').type('{enter}');
  cy.wait(15000);
  cy.get('.buster-chart-card-container')
    .contains('Processing your', { matchCase: false })
    .should('not.exist', { timeout: 30000 });
  cy.screenshot();
});

describe('all questions spec', () => {
  before(() => {
    // Clear all cookies and localStorage
    cy.clearCookies();
    cy.clearLocalStorage();

    // Clear all sessions and cache
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.caches?.keys().then((keys) => {
        keys.forEach((key) => win.caches.delete(key));
      });
    });
    cy.viewport(1600, 900);
    cy.loginToBuster();
  });

  beforeEach(() => {
    cy.viewport(1600, 900);
    cy.wait(250);
  });

  const ALL_QUESTIONS = [
    // 'is there a pattern between the types of devices customers use and the number of issues they report',
    // 'how does agent training hours relate to their customer satisfaction scores. show this for the last two years',
    // 'are clients with overdue balances more likely to have unresolved tickets',
    // "what's the avg time it takes to resolve issues for vip customers compared to regular customers",
    // 'do clients who receive more discounts contact support more often',
    // 'find out if the number of policy breaches by agents affects their average resolution times',
    // 'is there any trend in customer exit reasons over the last five years. categorize the reasons and show changes over time',
    // "what's the avg time between a customer's feedback and when they are contacted for follow-up. is this time affecting their satisfaction levels",
    // 'do support tickets that involve multiple departments take longer to resolve. compare the resolution times',
    // 'is there a correlation between the language proficiency of agents and the resolution status of tickets they handle',
    // "what's the average wait time in the call center and how does it affect customer survey scores",
    // 'are customers who access our services during off-peak hours experiencing more errors',
    // 'how does the number of reassignments of a ticket impact its total resolution time',
    // 'is there a relationship between the time an agent spends on training and the number of compliance violations they have',
    'give me a report on recent customer interactions',
    'give me some info about our agents',
    'give me the latest stats',
    'how many support tickets will we have next month based on current trends. explain how you get this',
    'what is our call volume from the last four months. explain the results plz',
    'what are customer churn rates for last quarter. what is influencing it?',
    'what would happen to our average resolution time if we added two more team members',
    'If we reduce ticket priority levels from four to three how would that affect our service compliance',
    'if we implement a new training program; how might that influence customer satisfaction ratings?',
    'get me a summary of customer mood and how it impacts employee turnover rates',
    'do seasonal changes impact our support channel effectiveness?',
    'Assess the impact of product updates on the frequency of support requests.',
    'how many complaints did we get last month?',
    'show me our average call duration',
    'How many new users did we get this week',
    'show me total resolved chats and average customer satisfaction score for each support rep. do it on a bar chart.',
    'show me total ticket counts from the last month broken down by issue type',
    'what are the most accessed help articles?',
    'Give me an overview of our recent customer service performance.',
    "I'd like a report on customer feedback trends. What kinds of insights can you provide?",
    'Can you summarize our support ticket activity over the last quarter?',
    'get the average earnings per client based on support ticket history.',
    'show me the correlation between training hours completed and customer satisfaction ratings',
    'give me a list of each client and the total interactions they had this month',
    'show me total escalations for vip customers',
    'which reps have resolved the most issues',
    'how effective was our last marketing campaign',
    'show me employee satisfaction scores for last year vs this year',
    'show me uptime stats',
    'Pull average resolution time for escalated issues.',
    'build a heatmap showing customer satisfaction over time',
    'gimme a sunburst chart of our customer satisfaction scores',
    'show me ticket volumes by region. put it on a map',
    'show me total tickets for the last 30 days, and share the report w greg',
    'get me a summary report of our call center performance lately',
    'what kind of stuff can you get me?',
    'what kind of charts can you build for my monthly sales data?',
    'what can you show me about customer churn?',
    'how can you calculate avg call duration',
    'how are you able to show customer satisfaction scores?',
    'how can you pull churn rate?',
    'create a bar chart of total tickets for the last 3 years',
    'avg customer satisfaction by agent. make it a pie chart.',
    'line chart of escalations we had over the last quarter',
    'How many tickets were closed last week? Explain how you get it.',
    'shiw me avg response time and tell me how you got it.',
    'get me total revenue per customer. tell me how you got it too',
    'can you show me a dashoard of some of our kpis',
    'pull our latest sales stuff and forward it to me',
    'show me customer feedback stats',
    'gimme a waterfall chart of monthly rev',
    'show me some agent performance metrics',
    'what can you tell me about our recent agent performance? Specifically, how new hires compare to vets',
    'Get a bar chart of tickets per agent it and explain how you got it',
    'Show me avg response times for the last week. throw it on a line chart',
    'Pull customer feedback scores create a pie chart and explain the data to me.',
    'Create a dashboard with the latest ticket stats in a bar chart.',
    'Pull the average response times. put it on a line chart and add it to a report for me',
    'pull nps scores',
    'Create a report on agent performance and email it to me',
    'Pull stats from last month'
  ];

  ALL_QUESTIONS.forEach((question) => {
    it(`can ask question ${question}`, () => {
      cy.visit('localhost:3000/app/metrics');
      cy.askQuestion(question);
      cy.get('.buster-chart-card-container').should('be.visible');
    });
  });
});
