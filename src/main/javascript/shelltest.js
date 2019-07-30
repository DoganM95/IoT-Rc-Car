console.log("initial call working!");
main();
console.log("entering endless loop now!!");
while(true){}

function main(){
	let i = 0;
	setTimeout(function(){
		console.log("Iteration " + (++i));
	}, 10000);
}
