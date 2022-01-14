import 'cypress-localstorage-commands'

Cypress.Commands.add('carregamentoEmostradoEoculto', () => {
  cy.contains('Loading ...').should('be.visible')
  cy.contains('Loading ...').should('not.exist')
})
