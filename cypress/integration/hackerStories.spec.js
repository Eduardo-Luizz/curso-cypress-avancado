
describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Batendo na API de verdade', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/search?query=React&page=0').as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
      // Uma outra maneira de substituir o intercept :
      // cy.intercept({
      //   method: 'GET,
      //   pathname: '**/search',
      //   query: {
      //     query: 'React',
      //     page: '0'
      //   }
      // }).as('getStories')
      // cy.visit('/')
      // cy.wait('@getStories')
    })
    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept('GET', '**/search?query=React&page=1').as('getNextStories')
      cy.get('.item').should('have.length', 20)
      cy.contains('More')
        .should('be.visible')
        .click()
      cy.wait('@getNextStories')
      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept('GET', `**/search?query=${newTerm}&page=0`).as('getNewTermStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
        .should('be.visible')
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.getLocalStorage('search')   // Verificando se a ultima busca esta salva de maneira correta no local storage
        .should('be.equal', newTerm)

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.getLocalStorage('search')  // Verificando se a ultima busca esta salva de maneira correta no local storage // Inspecionar aplicattion local storge se encontra a chave que vai no lugar do search
      .should('be.equal', initialTerm)

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocando a API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' }
        ).as('getStories')
        cy.visit('/')
        cy.wait('@getStories')
        // Uma outra maneira de substituir o intercept :
        // cy.intercept({
        //   method: 'GET,
        //   pathname: '**/search',
        //   query: {
        //     query: 'React',
        //     page: '0'
        //   }
        // }).as('getStories')
        // cy.visit('/')
        // cy.wait('@getStories')
      })

      it('mostra o rodapé', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        it('shows the right data for all rendered stories', () => {
          const stories = require('../fixtures/stories.json')

          cy.get('.item')
            .first()
            .should('be.visible')
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            //.and('contain', stories.hits[0].numComentarios)
            .and('contain', stories.hits[0].points)
          
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

            cy.get('.item')
            .last()
            .should('be.visible')
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            //.and('contain', stories.hits[1].numComentarios)
            .and('contain', stories.hits[1].points)

          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one less story after dimissing the first story', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()

          cy.get('.item').should('have.length', 0)
        })

        context('Order by', () => {
          it('orders by title', () => {
            const stories = require('../fixtures/stories.json')
            cy.get('.list-header-button:contains(Title)').as('titleHeader') // -- Importante
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })
          it('orders by author', () => {
            const stories = require('../fixtures/stories.json')
            cy.get('.list-header-button:contains(Author)').as('authorHeader') // -- Importante

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)
            
            cy.get('@authorHeader')

            cy.get('.item')
              .last()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })
          it('orders by comments', () => {
            const stories = require('../fixtures/stories.json')
            cy.get('.list-header-button:contains(Comments)').as('commentHeader') // -- Importante

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('not.contain', stories.hits[0].numComentarios)

            cy.get('@commentHeader')
              
            cy.get('.item')
              .last()
              .should('be.visible')
              .and('not.contain', stories.hits[1].numComentarios)
          })
          it('orders by points', () => {
            const stories = require('../fixtures/stories.json')
            cy.get('.list-header-button:contains(Points)').as('pointsHeader') // -- Importante
              
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)

            cy.get('@pointsHeader')
              
            cy.get('.item')
              .last()
              .should('be.visible')
              .and('contain', stories.hits[1].points)
          })
        })
      })
    })

    context('Search', () => {
      const initialTerm = 'React'
      const newTerm = 'Cypress'

      beforeEach(() => {
        cy.intercept(
          'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'emptyStories' }
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .should('be.visible')
          .clear()
      })

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .should('be.visible')
          .type(`${newTerm}{enter}`)

        cy.wait('@getStories')

        cy.getLocalStorage('search') 
          .should('be.equal', newTerm)
        

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .should('be.visible')
          .type(newTerm)
        cy.contains('Submit')
          .should('be.visible')
          .click()

        cy.wait('@getStories')

        cy.getLocalStorage('search') 
        .should('be.equal', newTerm)

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')

          cy.intercept(
            'GET', 
            '**/search**',
            {fixture: 'emptyStories'}
            ).as('getRandomStories') 

          Cypress._.times(6, () => { // Repete 5 vezes
            const randomWord = faker.random.word()
            cy.get('#search')
              .should('be.visible')
              .clear()
              .should('be.visible')
              .type(`${randomWord}{enter}`)
            cy.wait('@getRandomStories')
            cy.getLocalStorage('search')
              .should('be.equal', randomWord)
          })

          cy.get('.last-searches') // Seletores muito complexos ou grandes demais 
            .within(() => {
              cy.get('button')
                .should('have.length', 5)
            })
        })
      })
    })
  })
})

context('Errors, forçar falhas', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**', { statusCode: 500 }).as('getServerFailure') // Como não sei oque vem antes e nem depois é assim que devo fazer

    cy.visit('/')

    cy.wait('@getServerFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**', { forceNetworkError: true }).as('getNetworkFailure')

    cy.visit('/')

    cy.wait('@getNetworkFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible')
  })
})

context('Simulando atrasos na chamada a API', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        '**/search**',
        {
          delay: 2000,
          fixture: 'stories'
        }
      ).as('getDelayStories')
    })

    it('shows a "Loading ..." state before showing the results', () => {
      cy.visit('/')
    
      cy.carregamentoEmostradoEoculto()
    
      cy.wait('@getDelayStories')

      cy.get('.item').should('have.length', 2)
      
    })
  })
