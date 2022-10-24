const appTimer = document.querySelector('.appTimer'); // selecting the html class and attaching it to a javascript object 
const timer = document.createElement('div'); // displays timer 
const btn1 = document.createElement('button'); 
const btn2 = document.createElement('button'); 
const game = {timer:null, start: null, end: null}; // this displays the time in the game OBJECT. 

appTimer.append(timer); // this adds the buttons and the timer to the page. 
appTimer.append(btn1); 
appTimer.append(btn2); 

btn1.textContent = 'Start'; 
btn2.textContent = 'Stop'; 
btn2.disabled - true; //btn2 cannot be clicked at this time
btn1.addEventListener('click', startTimer); 
btn1.addEventListener('click', showTimer);
btn2.addEventListener('click', stopTimer); 

function startTimer(){
console.log('start'); 
btn1.disabled = true; 
btn2.disabled = false; 
const date = new Date(); // get current date 
game.start = date.getTime(); // get current time in milliseconds 
}

function stopTimer(){
    console.log('stop'); 
    btn1.disabled = false; 
    btn2.disabled = true; 
    const date = new Date(); 
    game.end = date.getTime(); 
    const totalTime = ((game.end - game.start)/1000); //dividing the total time by 1000 gets the milliseconds. 
    console.log(totalTime); 
}
function showTimer(){ // this will show the game timer every ten 
    var min; 
    var secs; 
    var milliseconds;  
    game.timer = setInterval(() => {
        if (btn2.disabled) return;
      const diff = new Date().getTime() - game.start; 
      min = parseInt(diff/1000/60); 
      min = min < 10 ? '0' + min : min; // this will give the string value for minutes
      secs = parseInt(diff/1000); 
      secs = secs < 10 ? '0' + secs : secs;
      if (secs > 60) secs %= 1000; 
      milliseconds = diff; 
      if (milliseconds > 1000) milliseconds %= 1000; 
      console.log(min, secs, milliseconds);
      document.getElementById("time").textContent = `${min} : ${secs} : ${milliseconds}`; 
    //   timer.textContent = `${min} : ${secs} : ${milliseconds}`; 
    }, 10)

}

const start = new Date('July 1, 2000');
const end = new Date ('August 1, 2000')
console.log(start.getTime()); 
console.log(end.getTime()); 
const diff = end.getTime() - start.getTime(); 
console.log(diff); 
const seconds = parseInt(diff/1000); 
const minutes = parseInt(diff/1000/60); 
console.log(minutes,seconds); 
console.clear(); 