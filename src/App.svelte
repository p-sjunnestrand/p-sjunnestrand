<script>
	import {onMount} from "svelte";
	
	import Login from "./Login.svelte";
	import Welcome from "./Welcome.svelte";

	let loggedIn = false;
	let power = false;
	let firstLoad = true;

	const handleSubmit = (e) => {
		if(e.detail.user === "admin" && e.detail.psw === "psw123"){
			loggedIn = !loggedIn
		} else {
			console.log("denied!");
		}
	}

</script>

<style type="text/scss">
	@use "sass:math";

	$monitor-height: 95vh;
	$monitor-width: 90vw;
	$stand-height: calc(100vh - $monitor-height);
	$stand-width: calc($monitor-width/2);
	$screen-width: 95%;
	$screen-height: 90%;
	$bevel-width: 90%;
	$bevel-height: 85%;

	#monitor{
		width: $monitor-width;
		background-color: rgb(143, 143, 128);
		border: 2px solid rgb(190, 190, 171);
		height: $monitor-height;
		position: relative;
		left: calc(50% - $monitor-width/2);
		top: calc((100vh - $monitor-height)/2);
		border-radius: 2em;
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
		position: relative;
		width: $screen-width;
		height: $screen-height;
		left: calc((100% - $screen-width)/2);
		top: calc($screen-height * 0.05);
		border-radius: 2em;
		padding: 1em;
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
		background-color: lime;
		box-shadow: lime 0px 0px 5px;
	}
	.red{
		background-color: red;
		box-shadow: red 0px 0px 5px;
	}
	.on{
		background-color: rgb(98, 0, 255);
		border: 1px solid rgb(0, 0, 150);

		&:after{
			content: "";
			display: block;
			position: absolute;
			inset: 0;
			background-color: rgb(31, 31, 31);
			z-index: 0;
			border-radius: 2em;
			animation: greyBackdrop 0.2s linear forwards;
		}
		&:before{
			content: "";
			display: block;
			position: absolute;
			inset: 3%;
			background-color: rgb(255, 255, 255);
			z-index: 1;
			
			animation: powerSwitch 0.2s linear reverse forwards;
			
		}
	}
	.off{
		background-color: rgb(31, 31, 31);
		border: 1px solid black;
		
		&:after{
			content: "";
			display: block;
			position: absolute;
			inset: 3%;
			background-color: rgb(255, 255, 255);
			
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
</style>

<div id="monitor">
	<div id="bevel">
		<div id="screen" class="{firstLoad? "firstLoad" : power ? "on" : "off"}">
			{#if power}
				{#if !loggedIn}
				<Login on:submit={handleSubmit}/>
				{:else}
				<Welcome />
				{/if}
			{/if}
		</div>
	</div>
	<div id="knob-plate">
		<div id="on-light" class="{power ? "green" : "red"}"></div>
		<!--Turns the screen on/off. firstLoad ensures that the animation will not play when page is loaded first time-->
		<div class="button" on:click={() => power = !power} on:click|once={() => firstLoad = false}></div>
	</div>
		
</div>
<!-- <div id="stand"></div>
<div id="curve-left" class="curve"></div>
<div id="curve-right" class="curve"></div> -->

	<!--#stand{
	// 	position: relative;
	// 	bottom: 0;
	// 	left: calc(50% - $stand-width/2);
	// 	height: $stand-height;
	// 	width: $stand-width;
	// 	background-color: black;
	// }
	// .curve{
	// 	position: absolute;
	// 	bottom: calc($stand-height * 0.1);
	// 	height: calc($stand-height * 0.9);
	// 	width: calc(50vw - $stand-width * 0.1);
	// 	background-color: burlywood;
	// }
	// #curve-left{
	// 	left: 0;
	// 	border-bottom-right-radius: 50%;
	// }
	// #curve-right{
	// 	right: 0;
	// 	border-bottom-left-radius: 50%;
	// } 

// #bevel::before{
	// 	display: block;
	// 	content: "";
	// 	background-color: red;
	// 	transform: rotate(calc(360deg - math.atan($bevel-height / $bevel-width)));
	// 	transform-origin: top left;
	// 	width: 900px;
	// 	height: 1px;
	// 	// border-bottom: 1px solid red;
	// 	// box-sizing: border-box;
	// 	position: relative;
	// 	left: 0;
	// 	top: 100%;
	// }-->