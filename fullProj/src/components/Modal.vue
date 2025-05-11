<template>
    <div class="wrapper">
        <div class="modale">
            <slot></slot>
        </div>
    </div>
</template>
<!--
    questo componente serve per visualizzare i to-do
    il suo funzionamento è dato dal tag slot che prende l'html che viene racchiuso tra i tag <Modal> e lo sostituisce ai tag slot
    inoltre viene applicato lo stile qui indicato
-->
<style scoped>
.modale{
    background-color: white;
    margin: 10% auto;
    padding: 20px;
    border: 1px solid #888888;
    width: fit-content;
    font-weight: bolder;
    z-index: 1000;
}
.wrapper{
    position: fixed;
    z-index: 999;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>