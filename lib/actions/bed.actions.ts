export const getBedAvailability = async () => {
    // const response = await fetch("https://your-backend-api.com/beds");
    return {"totalBeds":1,"availableBeds":1,"occupiedBeds":0}; // Should return { totalBeds, availableBeds, occupiedBeds }
  };
  
  export const getBedEmptyPrediction = async () => {
    // const response = await fetch("https://your-backend-api.com/prediction");
    return {"emptyTime":5}; // Should return { emptyTime: 5 } meaning 5 hours
  };
  