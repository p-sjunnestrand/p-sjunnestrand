<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    let input = "";

    // const codeArray = [
    //     {
    //         command: "run -p",
    //         main: 
    //     }
    // ]

    

    const handleSubmit = (e) => {
        if(e.key === "Enter"){
            // console.log(e);
            
            //Splits the input to check if command is correct and if following specification is correct.
            const inputArray = e.target.value.split(" ");
            const firstArray = inputArray.slice(0, 2).join(" ");
            const secondArray = inputArray.slice(2).join(" ");
    
            //Checks if entered value is a positive integer.
            // const isNumeric = (value) => {
            //     return /^\d+$/.test(value);
            // }
    
            dispatch("command", {
                command: firstArray,
                argument: secondArray
            });
            e.target.value = "";
            // switch (firstArray) {
            //     case "run -p" :
            //         switch (secondArray){
            //             case "main":
            //                 console.log("main");
            //                 dispatch("command");
            //                 break;
            //             case "modules":
            //                 console.log("modules");
            //                 dispatch("command", {
            //                     command: firstArray,
            //                     document: secondArray
            //                 });
            //                 break;
            //             case "edu":
            //                 console.log("edu");
            //                 break;
            //             case "work":
            //                 console.log("work");
            //                 break;
            //             case "portf":
            //                 console.log("portf");
            //                 break;
            //             case "specs":
            //                 console.log("specs");
            //                 break;
            //             default: 
            //                 console.log(`${secondArray} is not at program`);
            //         }
            //         break;
            //     case "sys exit":
            //         if(!secondArray){
            //             console.log("logging out...");
            //         } else {
            //             console.log(`${secondArray} is not a valid argument`);
            //         }
            //         break;
            //     case "sys shutdown":
            //         if(secondArray === "-n"){
            //             console.log("shutting down");
            //         } else if(isNumeric(secondArray)){
            //             console.log(`shutting down in ${secondArray} seconds`);
            //         } else {
            //             console.log(`${secondArray} is not a valid argument`);
            //         }
            //         break;
            //     // case "open"
            //     default:
            //         console.log("invalid command");
            // }

        }
    

        
    }
</script>

<style>
    input{
        width: 100%;
        color: white;
        background-color: rgb(98, 0, 255);;
    }
</style>

<input type="text" bind:value={input} on:keyup|stopPropagation={handleSubmit}/>