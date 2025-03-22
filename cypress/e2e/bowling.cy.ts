describe("Bowling Score Tracker", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("should display the title", () => {
    cy.contains("Bowling Score Tracker").should("be.visible");
  });

  it("should allow adding a user and starting the game", () => {
    // Add a user (assuming there's an input field in UserManagement)
    cy.get("[data-testid='username-input']").type("Alice", { force: true });
    cy.get("[data-testid='add-user-button']").click({ force: true });

    cy.get("[data-testid='username-input']").type("Bob", { force: true });
    cy.get("[data-testid='add-user-button']").click({ force: true });

    // Check if the user is added to the list
    cy.contains("Alice").should("be.visible");
    cy.contains("Bob").should("be.visible");

    // Start the game
    cy.get("[data-testid='start-game-button']").click({ force: true });

    // Verify that ScoreTracker is displayed
    cy.contains("Score Tracker").should("be.visible");
    cy.contains("Score Input").should("be.visible");
    cy.contains("Scoreboard").should("be.visible");
    cy.contains("Player").should("be.visible");
  });

  it("Should run the game to the end and show winner", () => {
    cy.get("[data-testid='username-input']").type("Alice", { force: true });
    cy.get("[data-testid='add-user-button']").click({ force: true });

    cy.get("[data-testid='username-input']").type("Bob", { force: true });
    cy.get("[data-testid='add-user-button']").click({ force: true });
    
    // Start the game
    cy.get("[data-testid='start-game-button']").click({ force: true });

    // Test button submit maximum time with maximum score
    const MAX_FRAME = 10;

    const n = (MAX_FRAME - 1) * 2 + 3 * 2; // Frame 1st-9th * 2 user + frame 10th (3 times), all Strike

    // Use a more reliable approach for entering scores
    for (let i = 0; i < n - 1; i++) {
      cy.get("[data-testid='input-score']").should('be.visible').clear({ force: true });
      cy.get("[data-testid='input-score']").type("10", { force: true });
      cy.get("[data-testid='submit-button']").click({ force: true });
    }
    
    // Last throw Bob has 9 point
    cy.get("[data-testid='input-score']").should('be.visible').clear({ force: true });
    cy.get("[data-testid='input-score']").type("9", { force: true });
    cy.get("[data-testid='submit-button']").click({ force: true });

    // Use data-testid for more reliable selection
    cy.get("[data-testid='winner-announcement']").should("be.visible");
    cy.contains("Congratulations").should("be.visible");
    cy.contains("Alice").should("be.visible");
    
    // Use data-testid to click the restart button with force option
    cy.get("[data-testid='restart-game-button']").click({ force: true });
    
    // Verify that we're back to the user management screen
    cy.get("[data-testid='username-input']").should("be.visible");
  });
});
