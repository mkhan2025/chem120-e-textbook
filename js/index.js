

document.getElementById('highest-score').textContent = `Your highest score: ${localStorage.getItem('highestScore') || 0}`