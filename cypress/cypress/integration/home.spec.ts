/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cySetup,
  cyMockDefault,
  cyMockTrain,
  cyMockTrainStatus,
} from '../support/functions';
import clint from '../fixtures/mentor/clint_home';
import { JobState } from '../support/types';

describe('Review answers page', () => {
  it('shows all questions for all subjects by default', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=select-subject]').contains('All Answers (4 / 5)');
    cy.get('[data-cy=recording-blocks]').children().should('have.length', 2);
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Background');
        cy.get('[data-cy=block-progress]').should('have.text', '2 / 2 (100%)');
        cy.get('[data-cy=block-description]').should(
          'have.text',
          'These questions will ask general questions about your background that might be relevant to how people understand your career.'
        );
        cy.get('[data-cy=answers-Complete]').should('contain', 'Complete (2)');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('not.exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 2);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              'Who are you and what do you do?'
            );
            cy.get('[data-cy=answer-0]').contains(
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
            );
            cy.get('[data-cy=answer-1]').contains('How old are you now?');
            cy.get('[data-cy=answer-1]').contains("I'm 37 years old");
          });
        });
        cy.get('[data-cy=answers-Incomplete]').should(
          'contain',
          'Incomplete (0)'
        );
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').should('be.disabled');
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 0);
        });
      });
      cy.get('[data-cy=block-1]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Repeat After Me');
        cy.get('[data-cy=block-progress]').should('have.text', '2 / 3 (67%)');
        cy.get('[data-cy=block-description]').should(
          'have.text',
          "These are miscellaneous phrases you'll be asked to repeat."
        );
        cy.get('[data-cy=answers-Complete]').should('contain', 'Complete (2)');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('not.exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 2);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              'Please look at the camera for 30 seconds without speaking. Try to remain in the same position.'
            );
            cy.get('[data-cy=answer-1]').contains(
              'Please give a short introduction of yourself, which includes your name, current job, and title.'
            );
            cy.get('[data-cy=answer-1]').contains(
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate"
            );
          });
        });
        cy.get('[data-cy=answers-Incomplete]').should(
          'contain',
          'Incomplete (1)'
        );
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
            );
          });
        });
      });
    });
  });
  it('shows mentor scope card', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=stage-card]').contains('Scope: Scripted');
    cy.get('[data-cy=stage-card]').contains(
      'Your mentor can respond to questions picked from a list.'
    );
  });

  it('can pick a subject from dropdown and view questions and categories', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=select-subject]').contains('All Answers (4 / 5)');
    cy.get('[data-cy=select-subject]').trigger('mouseover').click();
    cy.get('[data-cy=select-background]').trigger('mouseover').click();
    cy.get('[data-cy=select-subject]').contains('Background (2 / 2)');
    cy.get('[data-cy=recording-blocks]').children().should('have.length', 2);
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category');
        cy.get('[data-cy=block-progress]').should('have.text', '1 / 1 (100%)');
        cy.get('[data-cy=block-description]').should('have.text', 'A category');
        cy.get('[data-cy=answers-Complete]').should('contain', 'Complete (1)');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('not.exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              'Who are you and what do you do?'
            );
            cy.get('[data-cy=answer-0]').contains(
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
            );
          });
        });
        cy.get('[data-cy=answers-Incomplete]').should(
          'contain',
          'Incomplete (0)'
        );
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').should('be.disabled');
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 0);
        });
      });
      cy.get('[data-cy=block-1]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Background');
        cy.get('[data-cy=block-progress]').should('have.text', '1 / 1 (100%)');
        cy.get('[data-cy=block-description]').should(
          'have.text',
          'These questions will ask general questions about your background that might be relevant to how people understand your career.'
        );
        cy.get('[data-cy=answers-Complete]').should('contain', 'Complete (1)');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('not.exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains('How old are you now?');
            cy.get('[data-cy=answer-0]').contains("I'm 37 years old");
          });
        });
        cy.get('[data-cy=answers-Incomplete]').should(
          'contain',
          'Incomplete (0)'
        );
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').should('be.disabled');
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 0);
        });
      });
    });
  });

  it('can pick a subject from query params and view questions and categories', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/?subject=background');
    cy.get('[data-cy=select-subject]').contains('Background (2 / 2)');
    cy.get('[data-cy=recording-blocks]').children().should('have.length', 2);
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category');
        cy.get('[data-cy=block-progress]').should('have.text', '1 / 1 (100%)');
        cy.get('[data-cy=block-description]').should('have.text', 'A category');
        cy.get('[data-cy=answers-Complete]').should('contain', 'Complete (1)');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('not.exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              'Who are you and what do you do?'
            );
            cy.get('[data-cy=answer-0]').contains(
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
            );
          });
        });
        cy.get('[data-cy=answers-Incomplete]').should(
          'contain',
          'Incomplete (0)'
        );
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').should('be.disabled');
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 0);
        });
      });
      cy.get('[data-cy=block-1]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Background');
        cy.get('[data-cy=block-progress]').should('have.text', '1 / 1 (100%)');
        cy.get('[data-cy=block-description]').should(
          'have.text',
          'These questions will ask general questions about your background that might be relevant to how people understand your career.'
        );
        cy.get('[data-cy=answers-Complete]').should('contain', 'Complete (1)');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').should('not.be.disabled');
          cy.get('[data-cy=add-question]').should('not.exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains('How old are you now?');
            cy.get('[data-cy=answer-0]').contains("I'm 37 years old");
          });
        });
        cy.get('[data-cy=answers-Incomplete]').should(
          'contain',
          'Incomplete (0)'
        );
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').should('be.disabled');
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 0);
        });
      });
    });
  });

  it('can record all complete for a subject', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=select-subject]').contains('All Answers (4 / 5)');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Background');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').trigger('mouseover').click();
        });
      });
    });
    cy.location('pathname').then(($el) =>
      assert($el.replace('/admin', ''), '/record')
    );
    cy.location('search').should(
      'equal',
      '?back=/?subject=undefined&status=COMPLETE&subject=background&category='
    );
  });

  it('can record all incomplete for a subject', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=select-subject]').contains('All Answers (4 / 5)');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-1]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Repeat After Me');
        cy.get('[data-cy=answers-Incomplete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').trigger('mouseover').click();
        });
      });
    });
    cy.location('pathname').then(($el) =>
      assert($el.replace('/admin', ''), '/record')
    );
    cy.location('search').should(
      'equal',
      '?back=/?subject=undefined&status=INCOMPLETE&subject=repeat_after_me&category='
    );
  });

  it('can record a single question in a subject', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=select-subject]').contains('All Answers (4 / 5)');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Background');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 2);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              'Who are you and what do you do?'
            );
            cy.get('[data-cy=answer-0]').within(($answer) => {
              cy.get('[data-cy=record-one]').trigger('mouseover').click();
            });
          });
        });
      });
    });
    cy.location('pathname').then(($el) =>
      assert($el.replace('/admin', ''), '/record')
    );
    cy.location('search').should(
      'equal',
      '?back=/?subject=undefined&videoId=A1_1_1'
    );
    cy.get('[data-cy=question-input]').within(($input) => {
      cy.get('textarea').should('have.text', 'Who are you and what do you do?');
      cy.get('textarea').should('have.attr', 'disabled');
    });
  });

  it('can add a mentor question to a subject', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/');
    cy.get('[data-cy=select-subject]').contains('All Answers (4 / 5)');
    cy.get('[data-cy=save-button]').should('be.disabled');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-1]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Repeat After Me');
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
          cy.get('[data-cy=add-question]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 2);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').within(($answer) => {
              cy.get('textarea').should('have.value', '');
              cy.get('textarea').should('not.have.attr', 'disabled');
            });
            cy.get('[data-cy=answer-1]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
        });
      });
    });
    cy.get('[data-cy=save-button]').should('not.be.disabled');
  });

  it('can record all complete for a category', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/?subject=background');
    cy.get('[data-cy=select-subject]').contains('Background (2 / 2)');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=record-all]').trigger('mouseover').click();
        });
      });
    });
    cy.location('pathname').then(($el) =>
      assert($el.replace('/admin', ''), '/record')
    );
    cy.location('search').should(
      'equal',
      '?back=/?subject=background&status=COMPLETE&subject=background&category=category'
    );
  });

  it('can record all incomplete for a category', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/?subject=repeat_after_me');
    cy.get('[data-cy=select-subject]').contains('Repeat After Me (2 / 3)');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category2');
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=record-all]').trigger('mouseover').click();
        });
      });
    });
    cy.location('pathname').then(($el) =>
      assert($el.replace('/admin', ''), '/record')
    );
    cy.location('search').should(
      'equal',
      '?back=/?subject=repeat_after_me&status=INCOMPLETE&subject=repeat_after_me&category=category2'
    );
  });

  it('can record a single question in a category', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/?subject=background');
    cy.get('[data-cy=select-subject]').contains('Background (2 / 2)');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category');
        cy.get('[data-cy=answers-Complete]').within(($completeAnswers) => {
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              'Who are you and what do you do?'
            );
            cy.get('[data-cy=answer-0]').within(($answer) => {
              cy.get('[data-cy=record-one]').trigger('mouseover').click();
            });
          });
        });
      });
    });
    cy.location('pathname').then(($el) =>
      assert($el.replace('/admin', ''), '/record')
    );
    cy.location('search').should(
      'equal',
      '?back=/?subject=background&videoId=A1_1_1'
    );
    cy.get('[data-cy=question-input]').within(($input) => {
      cy.get('textarea').should('have.text', 'Who are you and what do you do?');
      cy.get('textarea').should('have.attr', 'disabled');
    });
  });

  it('can add a mentor question to a category', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/?subject=repeat_after_me');
    cy.get('[data-cy=select-subject]').contains('Repeat After Me (2 / 3)');
    cy.get('[data-cy=save-button]').should('be.disabled');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category2');
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
          cy.get('[data-cy=add-question]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 2);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').within(($answer) => {
              cy.get('textarea').should('have.value', '');
              cy.get('textarea').should('not.have.attr', 'disabled');
            });
            cy.get('[data-cy=answer-1]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
        });
      });
    });
    cy.get('[data-cy=save-button]').should('not.be.disabled');
  });

  it('can edit a mentor question', () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit('/?subject=repeat_after_me');
    cy.get('[data-cy=select-subject]').contains('Repeat After Me (2 / 3)');
    cy.get('[data-cy=save-button]').should('be.disabled');
    cy.get('[data-cy=recording-blocks]').within(($blocks) => {
      cy.get('[data-cy=block-0]').within(($block) => {
        cy.get('[data-cy=block-name]').should('have.text', 'Category2');
        cy.get('[data-cy=answers-Incomplete]').within(($incompleteAnswers) => {
          cy.get('[data-cy=expand-btn]').trigger('mouseover').click();
          cy.get('[data-cy=add-question]').should('exist');
          cy.get('[data-cy=answer-list]').children().should('have.length', 1);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
          cy.get('[data-cy=add-question]').trigger('mouseover').click();
          cy.get('[data-cy=answer-list]').children().should('have.length', 2);
          cy.get('[data-cy=answer-list]').within(($answers) => {
            cy.get('[data-cy=answer-0]').within(($answer) => {
              cy.get('textarea').should('have.value', '');
              cy.get('textarea').should('not.have.attr', 'disabled');
              cy.get('[data-cy=edit-question]').type('test');
              cy.get('textarea').should('have.value', 'test');
            });
            cy.get('[data-cy=answer-1]').contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
        });
      });
    });
    cy.get('[data-cy=save-button]').should('not.be.disabled');
  });

  it('fails to train mentor', () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.FAILURE } });
    cy.visit('/');
    cy.get('[data-cy=train-button]').trigger('mouseover').click();
    cy.contains('Failed job');
  });

  it('can train mentor', () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.SUCCESS } });
    cy.visit('/');
    cy.get('[data-cy=train-button]').trigger('mouseover').click();
    cy.contains('Building...');
    cy.get('[data-cy=select-subject]').trigger('mouseover').click();
  });
});
