<script>
	import Login from "./Login.svelte";
	import Loading from "./Loading.svelte";
	import LoginStatus from "./LoginStatus.svelte"
	import Main from "./Main.svelte"

	let loggedIn = true;
	let power = true;
	let firstLoad = false;
	let loadingFinished = true;
	let access = undefined;
	let noteVisible = true;
	let noteOut = false;
	let bgColor = "#6200ff";
	
	const handleSubmit = (e) => {
		if(e.detail.user === "admin" && e.detail.psw === "psw123"){
			access = "approved";
		} else {
			access = "denied";
		}
		setTimeout(() => {
			if(access === "approved"){
				loggedIn = true;
			}
			access = undefined;
		}, 1500);
	}

	const shutdown = () => {
		loggedIn = false;
		loadingFinished = false;
		power = false;
	}
	const shutDownTimer = (e) => {
		const miliseconds = parseInt(e.detail.time)*1000;
		console.log(miliseconds);
		setTimeout(() => {
			loggedIn = false;
			loadingFinished = false;
			power = false;
		}, miliseconds);
	}
	const playNoteExitAnimation = () => {
		noteOut = true;
		setTimeout(() => {
			noteVisible = false;
		}, 1900);

	}
</script>

<style type="text/scss">
	@use "sass:math";

	$monitor-height: 99vh;
	$monitor-width: 99vw;
	$stand-height: calc(100vh - $monitor-height);
	$stand-width: calc($monitor-width/2);
	$screen-width: 95%;
	$screen-height: 90%;
	$bevel-width: 90%;
	$bevel-height: 85%;

	$light-on: rgb(255, 221, 68);
	$light-off: rgb(31, 31, 31);
	$green-status: lime;
	$red-status: red;

	#monitor{
		width: $monitor-width;
		background-color: rgb(143, 143, 128);
		border: 2px solid rgb(190, 190, 171);
		height: $monitor-height;
		position: relative;
		left: calc(50% - $monitor-width/2);
		top: calc((100vh - $monitor-height)/2);
		border-radius: 2em;
		box-sizing: border-box;
	}
	#bevel{
		height: $bevel-height;
		width: $bevel-width;
		position: relative;
		left: calc((100% - $bevel-width)/2);
		top: calc(($bevel-height * 0.05));
		border: solid 1px black;
		background-color: rgb(95, 95, 84);
	}
		#screen{
		overflow-y: scroll;
		position: relative;
		// font-size: 1.5em;
		width: $screen-width;
		height: $screen-height;
		left: calc((100% - $screen-width)/2);
		top: calc($screen-height * 0.05);
		border-radius: 2rem;
		padding: 1rem;
		box-sizing: border-box;
		box-shadow: rgba(0, 0, 0, 0.17) -2.5px -23px 25px 0px inset,
					rgba(0, 0, 0, 0.15) -5px -36px 30px 0px inset,
					rgba(0, 0, 0, 0.1) -15px -79px 40px 0px inset, 
					rgba(0, 0, 0, 0.06) 0px 2px 1px, 
					rgba(0, 0, 0, 0.09) 0px 4px 2px, 
					rgba(0, 0, 0, 0.09) 0px 8px 4px, 
					rgba(0, 0, 0, 0.09) 0px 16px 8px, 
					rgba(0, 0, 0, 0.09) 0px 32px 16px;
	}
	#knob-plate{
		height: calc($bevel-height * 0.08);
		width: calc($bevel-width * 0.2);
		border: 1px solid black;
		position: relative;
		left: calc((100% - $bevel-width * 0.9)/2);
		top: calc($bevel-height * 0.08);
		background-color: grey;
		display:flex;
		justify-content: space-evenly;
		align-items: center;
	}
	.button{
		width: 35%;
		height: 90%;
		box-shadow: rgba(0,0,0,0.4) 1px 1px 5px;
		background-color: rgb(95, 95, 84);
		overflow: hidden;
		color: black;

		&:before{
			display:block;
			position: relative;
			content: "O/I";
			width: 100%;
			height: 100%;
			background-color: rgb(143, 143, 128);
			left: -10%;
			top: -5%;
			// border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-family: monospace;
		}
		&:hover{
			cursor: pointer;
		}
	}
	#on-light{
		width: 10%;
		height: 10%;
	}
	.green{
		background-color: $green-status;
		box-shadow: lime 0px 0px 5px;
	}
	.red{
		background-color: $red-status;
		// box-shadow: red 0px 0px 5px;
		animation: pulse 1.5s infinite alternate;
	}
	@keyframes pulse{
		from{background-color: $red-status;
		box-shadow: red 0px 0px 5px;}
		to{background-color: rgb(31, 31, 31);}
	}
	.on{
		// background-color: #6200ff;
		// border: 1px solid #000096;

		&:after{
			content: "";
			display: block;
			position: absolute;
			inset: 0;
			background-color: rgb(31, 31, 31);
			z-index: 2;
			border-radius: 2em;
			animation: greyBackdrop 0.2s linear forwards;
		}
		&:before{
			content: "";
			display: block;
			position: absolute;
			inset: 3%;
			background-color: rgb(255, 255, 255);
			z-index: 3;
			
			animation: powerSwitch 0.2s linear reverse forwards;
			
		}
	}
	.off{
		background-color: #1f1f1f;
		border: 1px solid black;
		
		&:after{
			content: "";
			display: block;
			position: absolute;
			inset: 3%;
			background-color: rgb(255, 255, 255);
			z-index: 3;
			animation: powerSwitch 0.3s linear forwards;
			
		}
	}
	@keyframes powerSwitch{
		0%{transform: scale(0)}
		1%{transform: scale(1)}
		60%{transform: scale(1, 0.02)}
		90%{transform: scale(0, 0);
			opacity: 1;}
		100%{transform: scale(0, 0);
			opacity: 0;}
	}
	@keyframes greyBackdrop{
		0%{opacity: 1;
		transform: scale(1);}
		98%{opacity: 1;
		transform: scale(1);}
		99%{opacity: 0;
		transform: scale(1);}
		100%{transform: scale(0);}
	}
	.firstLoad{
		background-color: rgb(31, 31, 31);
		border: 1px solid black;
	}
	#led-plate{
		height: calc($bevel-height * 0.08);
		width: calc($bevel-width * 0.2);
		border: 1px solid black;
		position: relative;
		left: calc((100% - $bevel-width * 0.3));
		top: -0.25%;
		background-color: grey;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
	}
	.blinking-light{
		width: 3%;
		aspect-ratio: 1/1;
		background: rgb(31, 31, 31);
		border-radius: 50%;
	}
	#slow-pulse{
		animation: slow-pulse 1.5s infinite alternate;
	}
	#fast-ticks{
		animation: fast-ticks 7s infinite;
	}
	#green-status{
		animation: status 7s infinite;
	}
	@keyframes slow-pulse{
		from{background-color: rgb(255, 221, 68);
		box-shadow: rgb(255, 221, 68) 0px 0px 5px;}
		to{background-color: rgb(31, 31, 31);}
	}
	@keyframes fast-ticks{ 	
		0%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		6%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		7%{background-color: $light-off;}
		8%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		9%{background-color: $light-off;}
		10%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		11%{background-color: $light-off;}
		12%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		20%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		21%{background-color: $light-off;}
		22%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		52%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		53%{background-color: $light-off;}
		54%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		55%{background-color: $light-off;}
		56%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		80%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		81%{background-color: $light-off;}
		82%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		83%{background-color: $light-off;}
		84%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		85%{background-color: $light-off;}
		86%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		87%{background-color: $light-off;}
		88%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		89%{background-color: $light-off;}
		90%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
		100%{background-color: $light-on; box-shadow: $light-on 0px 0px 5px;}
	}
	@keyframes status{
		0%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		6%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		7%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		11%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		12%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		21%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		22%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		23%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		52%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		53%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		55%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		56%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		80%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		81%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		89%{background-color: $red-status; box-shadow: $red-status 0px 0px 5px;}
		90%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
		100%{background-color: $green-status; box-shadow: $green-status 0px 0px 5px;}
	}
	.hinge-exit{
		animation: hinge 2s forwards;
	}
	.note{
		position: absolute;
		width: 10%;
		aspect-ratio: 1/1;
		background-color: hsl(60, 100%, 50%);
		left: 87%;
    	top: 2%;
    	z-index: 10;
		color: black;
		padding: 1%;
		cursor: pointer;
		font-family: 'Caveat', cursive;
		
		@keyframes hinge{
			0%{
				transform:rotate(0);
				transform-origin:top left;
				animation-timing-function:ease-in-out
			}
			20%,60%{
				transform:rotate(60deg);
				transform-origin:top left;
				animation-timing-function:ease-in-out
			}
			40%{
				transform:rotate(40deg);
				transform-origin:top left;
				animation-timing-function:ease-in-out
			}
			80%{
				transform:rotate(40deg) translateY(0);
				opacity:1;
				transform-origin:top left;
				animation-timing-function:ease-in-out}
			100%{
				transform:translateY(500px);
				opacity:0
			}
			}
	}
</style>

<div id="monitor">
	{#if noteVisible}
		<div class="note {noteOut ? "hinge-exit" : null}" on:click={playNoteExitAnimation}>
			user: admin<br/>
			password: psw123
		</div>
	{/if}
	<div id="bevel">
		<div id="screen" class="{firstLoad? "firstLoad" : power ? "on" : "off"}" style="background-color: {power ? bgColor : null}">
			{#if power}
				{#if !loadingFinished}
					<Loading on:finishLoad={() => loadingFinished = true}/>
				{:else}
					{#if !loggedIn && !access}
						<Login on:submit={handleSubmit}/>
					{:else if !loggedIn}
						<LoginStatus {access}/>
					{:else}
						<Main on:logout={() => loggedIn = false} on:shutdown={shutdown} on:timer={shutDownTimer} on:bgcolor={e => bgColor = e.detail}/>
					{/if}
				{/if}
			{/if}
		</div>
	</div>
	<!--Move this to a separate module!-->
	<div id="knob-plate">
		<div id="on-light" class="{power ? "green" : "red"}"></div>
		<!--Turns the screen on/off. firstLoad ensures that the animation will not play when page is loaded first time-->
		<div class="button" on:click={() => power = !power} on:click|once={() => firstLoad = false}></div>
	</div>
	<!--This also needs its separate module!-->
	<div id="led-plate">
		<div id="{power ? "slow-pulse" : null}" class="blinking-light"></div>
		<div id="{power ? "fast-ticks" : null}" class="blinking-light"></div>
		<div id="{power ? "green-status" : null}" class="blinking-light"></div>
	</div>	
</div>
