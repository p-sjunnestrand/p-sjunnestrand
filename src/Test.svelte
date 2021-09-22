<script></script>

<style type="text/scss">
    div{
        height: 100px;
        width: 100px;
        background-color: white;
        font-size: 2em;
        color: red;
        position: relative;
        &:after{
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100px;
            height: 100px;
            background-color: green;
            animation: shrink 2s linear infinite;
            transform-origin: bottom;
        }
    }
    @keyframes shrink{
        100%{
            transform: scaleY(0.1);
        }
    }
</style>

<div>HELLO!</div>