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
    //This needs to be remade more efficiently.
    let pageDisplay = "modules";
    let openFile = "";
    let fileDesc = "";
    let openDir = "";
    let fileUrl = "";

    //Doesn't need to be exported?
    export let displayConsole = false;

    export let consoleArray = [];
    
    const dispatch = createEventDispatcher();
    
    const commandArray = [
            {program: "main", directory: undefined, file: undefined, altFile: undefined},
            {program: "modules", directory: undefined, file: "langtech", altFile: "langtech.sys"},
            {program: "modules", directory: undefined, file: "webproc", altFile: "webproc.sys"},
            {program: "work", directory: undefined, file: "0", altFile: undefined},
            {program: "work", directory: undefined, file: "1", altFile: undefined},
            {program: "work", directory: undefined, file: "2", altFile: undefined},
            {program: "work", directory: undefined, file: "3", altFile: undefined},
            {program: "work", directory: undefined, file: "4", altFile: undefined},
            {program: "edu", directory: undefined, file: undefined, altFile: undefined},
            {program: "portf", directory: "personal", file: "game_of_life", altFile: undefined, desc: "Implementation of the classic cellular automation first devised by John Horton Conway. Made in React.", url: "https://p-sjunnestrand.github.io/game-of-life/"},
            {program: "portf", directory: "personal", file: "gridpainter", altFile: undefined, desc: "An online co-op multiplayer game using socket.io. Work with three friends to paint a picture before the time is up. Made in vanilla JS.", url: "https://fed20d-grupp8-gridpainter.herokuapp.com/"},
            {program: "portf", directory: "personal", file: "trials_of_norns", altFile: undefined, desc: "A puzzle game made in vanilla JS. Test your wits and think outside the box.", url: "https://p-sjunnestrand.github.io/trials-of-norns/"},
            {program: "portf", directory: "clients", file: "forca_fighting", altFile: undefined, desc: "Website for a martial arts club in Stockholm. Made in React", url: "https://forcafighting.com/"},
            {program: "specs", directory: undefined, file: undefined, altFile: undefined},
            {program: "console", directory: undefined, file: undefined, altFile: undefined},
        ];

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
    const isNumeric = (value) => {
            return /^\d+$/.test(value);
    }
    const execCommand = (event) => {
        const programArray = ["main", "modules", "work", "edu", "portf", "specs", "console"];
        const fileArray = ["langtech", "webproc", "0", "1", "2", "3", "4"];
        const directoryArray = ["personal", "clients"];
        
        const command = event.detail.command;
        const argument = event.detail.argument;
        let matchingCommand;
        if(command === "help"){
            runCommandInConsole("help");
        }
        else if(command === "run -p"){
            // const program = programArray.find(program => program === argument);
            matchingCommand = commandArray.find(command => command.program === argument);

            if(matchingCommand === undefined){
                runCommandInConsole(`${argument} is not a program`);
            } else if(matchingCommand.program === "console"){
                displayConsole = true;
            }
            else {
                displayConsole = false;
                pageDisplay = matchingCommand.program;
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
            matchingCommand = commandArray.find(command => command.file === argument || command.altFile === argument);
        
            if(matchingCommand === undefined){
                runCommandInConsole(`${argument} is not a file`);
            }
            else {
                displayConsole = false;
                pageDisplay = matchingCommand.program;
                openFile = matchingCommand.file;
                console.log(openFile);
                //This needs to be remade with the object array above.
                if(matchingCommand.desc) {
                    fileDesc = matchingCommand.desc;
                    fileUrl = matchingCommand.url;
                    console.log(fileDesc);
                }
            }
        }
        else if(command === "open -d") {
            const directory = directoryArray.find(dir => dir === argument);
            matchingCommand = commandArray.find(command => command.directory === argument);
            if(matchingCommand === undefined) {
                runCommandInConsole(`${argument} is not a directory`);
            }
            else {
                displayConsole = false;
                pageDisplay = matchingCommand.program;
                openDir = matchingCommand.directory;
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
    }
    // const closeDir = () => {
    //     console.log("close dir!");
    // }
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
                <Modules {openFile} on:escPress={escPressed} on:command={execCommand} on:closeFile={() => openFile = ""}/>
            {:else if pageDisplay === "work"}
                <Work {openFile} on:escPress={escPressed} on:command={execCommand} on:closeFile={() => openFile = ""}/>
            {:else if pageDisplay === "edu"}
                <Education on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "portf"}
                <Portfolio {openDir} {openFile} {fileDesc} {fileUrl} on:escPress={() => displayConsole = true} on:command={execCommand} on:closeDir={() => openDir = ""} on:closeFile={() => openFile = ""}/>
            {:else if pageDisplay === "specs"}
                <Specs on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {/if}
        {:else}
            <Console on:command={execCommand} {consoleArray}/>
        {/if}
    {/if}
</section>