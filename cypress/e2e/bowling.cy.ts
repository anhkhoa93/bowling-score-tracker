describe("Bowling Score Tracker", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("should display the title", () => {
    cy.contains("Bowling Score Tracker").should("be.visible");
  });

  it("should allow adding a user and starting the game", () => {
    // Add a user (assuming there's an input field in UserManagement)
    cy.get("input[name='username']").type("Alice");
    cy.get("button").contains("Add User").click();

    cy.get("input[name='username']").type("Bob");
    cy.get("button").contains("Add User").click();

    // Check if the user is added to the list
    cy.contains("Alice").should("be.visible");
    cy.contains("Bob").should("be.visible");

    // Start the game
    cy.get("button").contains("Start Game").click();

    // Verify that ScoreTracker is displayed
    // Check if Alice and Bob are displayed in the ScoreTracker

    
    cy.contains("Score Tracker").should("be.visible");
    cy.contains("Score Input").should("be.visible");
    cy.contains("Scoreboard").should("be.visible");
    cy.contains("Player").should("be.visible");

  });

  it("Should run the game to the end and show winner", () => {

    cy.get("input[name='username']").type("Alice");
    cy.get("button").contains("Add User").click();

    cy.get("input[name='username']").type("Bob");
    cy.get("button").contains("Add User").click();
    // Start the game
    cy.get("button").contains("Start Game").click();

    // Test button submit maximum time with maximum score
    const MAX_FRAME = 10;

    const n = (MAX_FRAME - 1 ) * 2 + 3 * 2; // Frame 1st-9th * 2 user + frame 10th (3 times), all Strike

    for (let i = 0; i < n - 1; i++) {
      // Set the input-score value to 10
      // then click the submit button
      cy.get("input[name='input-score']").clear();
      cy.get("input[name='input-score']").type("10").should("have.value", "10");
      cy.get("button").contains("Submit").click();
    }
    // Last thow Bob have 9 point
    cy.get("input[name='input-score']").clear();
    cy.get("input[name='input-score']").type("9").should("have.value", "9");
    cy.get("button").contains("Submit").click();


    cy.contains("Congratulations").should("be.visible");
    cy.contains("Alice").should("be.visible");
    
  });
});
