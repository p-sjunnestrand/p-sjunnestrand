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
    
            dispatch("command", {
                command: firstArray,
                argument: secondArray
            });
            e.target.value = "";
        } 
    }
</script>

<style type="text/scss">
    .inputWrapper{
        display: flex;
        width: 100%;
        height: 7%;
        position: relative;

        &:before{
            content: ">";
            display: block;
            width: 5%;
            height: 100%;
            position: absolute;
            z-index: 1;
            left: 0;
            top: 0;
            font-size: 1.3rem;
            padding-top: 0.6%;
            padding-left: 1%;
            box-sizing: border-box;
        }
    }
    input{
        position: relative;
        width: 100%;
        color: white;
        background-color: transparent;
        height: 100%;
        padding-left: 2%;
    }
    
</style>
<div class="inputWrapper">
    <input type="text" bind:value={input} on:keyup|stopPropagation={handleSubmit}/>
</div>