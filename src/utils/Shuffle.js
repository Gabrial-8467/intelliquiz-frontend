  export const shuffleArray = (array) => {
    // Clone the array to avoid mutating the original
    const shuffled = [...array];
    
    // Fisher-Yates (Durstenfeld) algorithm for shuffling
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }

    return shuffled;
  };
