function executeWithRandomDelay(fn) {
  // Helper function to get a random delay between 30s (30000ms) and 2m (120000ms)
  function getRandomDelay() {
    const minDelay = 30000; // 30 seconds in milliseconds
    const maxDelay = 120000; // 2 minutes in milliseconds
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }

  // Function to execute the given function in a loop with a random delay
  function loop() {
    // Execute the provided function
    fn();

    // Set a timeout to call this function again after a random delay
    const delay = getRandomDelay();
    console.log(`Next execution in ${delay / 1000} seconds`);
    setTimeout(loop, delay);
  }

  // Start the loop
  loop();
}

// Example function to be executed
function exampleFunction() {
  console.log('Function executed at', new Date().toLocaleTimeString());
}

// Start executing the example function with a random delay
executeWithRandomDelay(exampleFunction);
