<script>
    import {createEventDispatcher} from 'svelte';
    
    const dispatch = createEventDispatcher();

    let user = "";
    let psw = "";

    //Dispatches values entered in user & psw fields on press on Enter.
    const handleKeyUp = (e) => {
        if(e.key === 'Enter'){
            dispatch('submit', {
                user: user,
                psw: psw
            })
        }
    };
</script>


<style>
    section{
        width: 100%;
        height: 100%;
        /* border: 1px solid red; */
        display: flex;
        justify-content: center;
        align-items: center;
    }
    input{
        background-color: rgba(0, 0, 0, 0);
        /* border: 1px solid white; */
        color: white;
    }
</style>


<section>
    <form on:keyup={handleKeyUp}>
        <label>user:<input type="text" bind:value={user}/></label>
        <label>psw:<input type="password" bind:value={psw}/></label>
    </form>
</section>

