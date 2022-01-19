<script>
    import WelcomeLogo from "./WelcomeLogo.svelte";
    import Header from "./Header.svelte";
    import WelcomeScreen from "./WelcomeScreen.svelte";
    import Modules from "./components/Modules.svelte";
    import Work from "./components/Work.svelte";
    import Education from "./components/Education.svelte";
    import Portfolio from "./components/Portfolio.svelte";
    import Specs from "./components/Specs.svelte";
    import Console from "./components/Console.svelte";
    import {createEventDispatcher} from "svelte";

    let logoFinished = true;
    let pageDisplay = "portf";
    let openFile = "";
    let openDir = "";

    //Doesn't need to be exported?
    export let displayConsole = false;

    export let consoleArray = [];
    
    const dispatch = createEventDispatcher();
    
    const runCommandInConsole = (message) => {
        consoleArray = consoleArray.concat(message);
        if(!displayConsole){
            displayConsole = true;
        }
    }

    const escPressed = () => {
        if(openFile){
            openFile = "";
        } else {
            displayConsole = true;
        }
    }
    const execCommand = (event) => {
        const programArray = ["main", "modules", "work", "edu", "portf", "specs", "console"];
        const fileArray = ["langtech", "webproc", "0", "1", "2", "3", "4"];
        const directoryArray = ["personal", "clients"];
        const command = event.detail.command;
        const argument = event.detail.argument;
        const isNumeric = (value) => {
                return /^\d+$/.test(value);
        }
        if(command === "help"){
            runCommandInConsole("help");
        }
        else if(command === "run -p"){
            const program = programArray.find(program => program === argument);

            if(program === undefined){
                runCommandInConsole(`${argument} is not a program`);
            } else if(program === "console"){
                displayConsole = true;
            }
            else {
                displayConsole = false;
                pageDisplay = program;
            }
        }
        else if(command === "sys exit"){
            if(!argument){
                dispatch('logout');
            }
            else {
                runCommandInConsole(`${argument} is not a valid argument`);
            }
        }
        else if(command === "sys shutdown"){
            if(argument === "-n"){
                dispatch("shutdown");
            
            } else if(isNumeric(argument)){
                dispatch('timer', {
                    time: (argument)
                })
                //Fix a visible timer counting down
                runCommandInConsole(`shutting down in ${argument} seconds`);
            } else {
                runCommandInConsole(`${argument} is not a valid argument`);
            }
        }
        else if(command === "open -f"){
            const file = fileArray.find(file => file === argument);
            console.log(file);
            console.log(argument);

            if(file === undefined){
                runCommandInConsole(`${argument} ${file} is not a file`);
            }
            else {
                displayConsole = false;
                openFile = file;
            }
        }
        else if(command === "open -d") {
            const directory = directoryArray.find(dir => dir === argument);

            if(directory === undefined) {
                runCommandInConsole(`${argument} ${directory} is not a directory`);
            }
            else {
                displayConsole = false;
                openDir = directory;
            }
        }
        else if(command === "sys color") {
            const reg=/^#([0-9a-f]{3}){1,2}$/i;
            if(reg.test(argument)) {
                dispatch('bgcolor', argument);
            } else if(argument === "-r") {
                const resetColor = "#6200ff"
                dispatch('bgcolor', resetColor);
            }
            else {
                runCommandInConsole('Syntax error: argument must be valid hex code');
            }
        }
        else {
            runCommandInConsole("Invalid command")
        }
        // if(command === "open -d")
        
    }
</script>

<style>
    section{
        height: 100%;
        width: 100%;
    }
</style>

<section>
    {#if !logoFinished}
        <WelcomeLogo on:logoLoaded={() => logoFinished = true}/>
    {:else}
        {#if !displayConsole}
            {#if pageDisplay === "main"}
                <WelcomeScreen on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "modules"}
                <Modules {openFile} on:escPress={escPressed} on:command={execCommand}/>
            {:else if pageDisplay === "work"}
                <Work {openFile} on:escPress={escPressed} on:command={execCommand}/>
            {:else if pageDisplay === "edu"}
                <Education on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "portf"}
                <Portfolio {openDir} {openFile} on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "specs"}
                <Specs on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {/if}
        {:else}
            <Console on:command={execCommand} {consoleArray}/>
        {/if}
    {/if}
</section>